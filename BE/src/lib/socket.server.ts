import type { Server as HttpServer } from "node:http";
import { Server as SocketIOServer } from "socket.io";
import { logger } from "@/config/pino.logger";

export interface DonationBroadcast {
  campaignId: string;
  campaignTitle: string;
  amount: string;
  donorName: string;
  createdAt: string;
}

export const SOCKET_EVENTS = {
  DONATION_CREATED: "donation:created",
} as const;

let io: SocketIOServer | null = null;

export const initSocketServer = (httpServer: HttpServer): SocketIOServer => {
  io = new SocketIOServer(httpServer, {
    cors: {
      origin: true,
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    logger.info({ socketId: socket.id }, "Socket client connected");

    socket.on("disconnect", (reason) => {
      logger.info({ socketId: socket.id, reason }, "Socket client disconnected");
    });
  });

  logger.info("Socket.io server initialized");
  return io;
};

export const getSocketServer = (): SocketIOServer => {
  if (!io) {
    throw new Error("Socket.io server has not been initialized");
  }
  return io;
};

export const emitDonationCreated = (payload: DonationBroadcast): void => {
  if (!io) {
    logger.warn("emitDonationCreated called before socket server init; skipping");
    return;
  }
  io.emit(SOCKET_EVENTS.DONATION_CREATED, payload);
};
