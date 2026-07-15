import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["test/**/*.test.ts"],
    testTimeout: 15000,
    hookTimeout: 20000,
    // black-box: đánh vào server đang chạy, chạy tuần tự cho ổn định
    fileParallelism: false,
  },
});
