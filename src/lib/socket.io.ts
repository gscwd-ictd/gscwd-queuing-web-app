import { Server as ServerIO } from "socket.io";

export const getIO = () => {
  if (typeof global.io !== "undefined") {
    return global.io as ServerIO;
  }
  return null;
};
