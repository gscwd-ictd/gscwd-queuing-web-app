import { Server as NetServer } from "http";
import { NextApiRequest } from "next";
import { NextApiResponseServerIO } from "@/next";
import { Server as ServerIO } from "socket.io";
import {
  GeneratedQueuingTicket,
  QueuingTicket,
} from "@/lib/types/prisma/queuingTicket";

export const config = {
  api: {
    bodyParser: false,
  },
};

export default function handler(
  req: NextApiRequest,
  res: NextApiResponseServerIO,
) {
  if (!res.socket.server.io) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const httpServer: NetServer = res.socket.server as any;
    const io = new ServerIO(httpServer, {
      path: "/api/socket/io",
      addTrailingSlash: false,
      transports: ["websocket", "polling"],
      allowUpgrades: true,
      pingTimeout: 25000,
      pingInterval: 10000,
      connectTimeout: 45000,
      cors: {
        origin: process.env.NEXTAUTH_URL,
        methods: ["GET", "POST", "PUT", "PATCH"],
      },
    });

    const connectedUsers = new Map();

    io.on("connection", (socket) => {
      console.log("Client connected:", socket.id);

      socket.on("authenticate", (userId: string) => {
        connectedUsers.set(socket.id, userId);
        console.log(`User ${userId} authenticated with socket ${socket.id}`);
      });

      socket.on("join-counter-room", (counterId: string) => {
        socket.join(`counter-${counterId}`);
        console.log(`Socket ${socket.id} joined room: counter-${counterId}`);
      });

      socket.on("join-counter-room", (counterId: string) => {
        socket.join(`counter:${counterId}`);
      });

      socket.on("join-main-display", () => {
        socket.join("display:main");
      });

      socket.on(
        "ring-bell",
        (
          ticketData: Partial<QueuingTicket> & {
            counterId: string;
            counterCode: string;
          },
        ) => {
          io.to(`counter:${ticketData.counterId}`).emit(
            "bell-rang",
            ticketData,
          );

          io.to("display:main").emit("bell-rang", ticketData);

          console.log("Bell rang", ticketData);
        },
      );

      socket.on("ticket-created", (data: GeneratedQueuingTicket) => {
        console.log("New ticket created:", data);
        io.emit("ticket-created", data);
      });

      socket.on("call-ticket", (data) => {
        console.log("Ticket called:", data);
        io.emit("ticket-called", data);
      });

      socket.on("start-transaction", (data) => {
        console.log("Transaction started", data);
        io.emit("transaction-started", data);
      });

      socket.on("mark-ticket-as-lapsed", (data) => {
        console.log("Ticket marked as lapsed:", data);
        io.emit("ticket-marked-as-lapsed", data);
      });

      socket.on("cancel-ticket", (data) => {
        console.log("Ticket cancelled:", data);
        io.emit("ticket-cancelled", data);
      });

      socket.on("transfer-ticket", (data) => {
        console.log("Ticket transferred:", data);
        io.emit("ticket-transferred", data);
      });

      socket.on("complete-transaction", (data) => {
        console.log("Transaction completed:", data);
        io.emit("transaction-completed", data);
      });

      socket.on("disconnect", () => {
        console.log("Client disconnected:", socket.id);
        connectedUsers.delete(socket.id);
      });
    });

    res.socket.server.io = io;
  }
  res.end();
}
