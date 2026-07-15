import { spawn, spawnSync } from "node:child_process";

const npmCli = process.env.npm_execpath;
if (!npmCli) throw new Error("npm_execpath is unavailable; run via npm run test:all");
const base = process.env.TEST_BASE_URL || "http://127.0.0.1:3000";

function run(args) {
  return new Promise((resolve, reject) => {
    const child = spawn(process.execPath, [npmCli, ...args], {
      stdio: "inherit",
      shell: false,
      env: process.env,
    });
    child.on("exit", (code) => code === 0 ? resolve() : reject(new Error(`${args.join(" ")} exited ${code}`)));
    child.on("error", reject);
  });
}

async function reachable() {
  try {
    const response = await fetch(`${base}/api/health`, { signal: AbortSignal.timeout(1000) });
    return response.ok;
  } catch {
    return false;
  }
}

async function waitForServer(timeoutMs = 60_000) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    if (await reachable()) return;
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
  throw new Error(`KindWave server did not become ready at ${base}`);
}

let server = null;
try {
  if (!(await reachable())) {
    server = spawn(process.execPath, [npmCli, "run", "dev"], {
      stdio: "inherit",
      shell: false,
      env: process.env,
    });
    await waitForServer();
  }
  await run(["run", "test:api"]);
  await run(["run", "test:e2e"]);
} finally {
  if (server && !server.killed) {
    if (process.platform === "win32") {
      spawnSync("taskkill.exe", ["/PID", String(server.pid), "/T", "/F"], {
        stdio: "ignore",
        shell: false,
      });
    } else {
      server.kill("SIGTERM");
    }
  }
}
