import { io, type Socket } from "socket.io-client";

import { ENV } from "@/config/env.config";

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

// Socket.io is mounted on the HTTP server root, not under /api.
const socketUrl = ENV.VITE_API_BASE_URL.replace(/\/api\/?$/, "");

let socket: Socket | null = null;

export const getSocket = (): Socket => {
  if (!socket) {
    socket = io(socketUrl, {
      autoConnect: true,
      transports: ["websocket", "polling"],
    });
  }
  return socket;
};

export const onDonationCreated = (
  handler: (payload: DonationBroadcast) => void
): (() => void) => {
  const activeSocket = getSocket();
  activeSocket.on(SOCKET_EVENTS.DONATION_CREATED, handler);
  return () => {
    activeSocket.off(SOCKET_EVENTS.DONATION_CREATED, handler);
  };
};

export const disconnectSocket = (): void => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};
