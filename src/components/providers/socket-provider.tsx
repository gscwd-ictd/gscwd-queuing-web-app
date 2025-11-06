"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import { useSession } from "next-auth/react";

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
}

const SocketContext = createContext<SocketContextType>({
  socket: null,
  isConnected: false,
});

export const useSocket = () => useContext(SocketContext);

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const { data: session, status } = useSession();

  useEffect(() => {
    if (typeof window === "undefined") return;

    const socketInstance = io(
      process.env.NEXT_PUBLIC_HOST || "http://localhost:3000",
      {
        path: "/api/socket/io",
        addTrailingSlash: false,
        autoConnect: true,
      }
    );

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, []);

  useEffect(() => {
    if (!socket) return;

    if (status === "authenticated" && session?.user?.id) {
      socket.connect();

      socket.on("connect", () => {
        console.log("Connected to server");
        setIsConnected(true);

        socket.emit("authenticate", session.user.id);
      });

      socket.on("disconnect", () => {
        console.log("Disconnected from server");
        setIsConnected(false);
      });
    }

    return () => {
      socket.off("connect");
      socket.off("disconnect");
    };
  }, [socket, status, session]);

  useEffect(() => {
    if (!socket) return;

    console.log("Socket connection state:", socket.connected);
    console.log("Socket ID:", socket.id);
  }, [socket, isConnected]);

  return (
    <SocketContext.Provider value={{ socket, isConnected }}>
      {children}
    </SocketContext.Provider>
  );
};
