import type { Server as HttpServer } from "http";
import { Server } from "socket.io";
import { env } from "../config/env.js";

export class SocketService {
  private io?: Server;

  attach(server: HttpServer) {
    this.io = new Server(server, {
      cors: {
        origin: env.CLIENT_URL,
        credentials: true
      }
    });

    this.io.on("connection", (socket) => {
      socket.join("board");
    });
  }

  emitBoardUpdated(payload: unknown) {
    this.io?.to("board").emit("board:updated", payload);
  }

  emitTaskDetailsUpdated(taskId: string, payload: unknown) {
    this.io?.to("board").emit("task:details-updated", {
      taskId,
      ...(payload as Record<string, unknown>)
    });
  }
}

export const socketService = new SocketService();
