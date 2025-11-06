import { DefaultSession } from "next-auth";
import { AccountStatus, Role, Route } from "@prisma/client";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      firstName: string;
      middleName?: string;
      lastName: string;
      nameExtension?: string;
      email: string;
      imageUrl: string;
      role: Role;
      position: string;
      departmentId?: string;
      counterId?: string;
      assignedTransactionId?: string;
      allowedRoutes: Route["path"][];
      accountStatus: AccountStatus;
      startTransactionHotkey: string | null;
      transferHotkey: string | null;
      completeTransactionHotkey: string | null;
      ringHotkey: string | null;
      markAsLapsedHotkey: string | null;
      nextTicketHotkey: string | null;
      nextLapsedTicketHotkey: string | null;
      nextSpecialTicketHotkey: string | null;
      nextLapsedSpecialTicketHotkey: string | null;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    firstName: string;
    middleName?: string;
    lastName: string;
    nameExtension?: string;
    email: string;
    imageUrl: string;
    role: Role;
    position: string;
    departmentId?: string;
    counterId?: string;
    assignedTransactionId?: string;
    allowedRoutes: Route["path"][];
    accountStatus: AccountStatus;
    startTransactionHotkey: string | null;
    transferHotkey: string | null;
    completeTransactionHotkey: string | null;
    ringHotkey: string | null;
    markAsLapsedHotkey: string | null;
    nextTicketHotkey: string | null;
    nextLapsedTicketHotkey: string | null;
    nextSpecialTicketHotkey: string | null;
    nextLapsedSpecialTicketHotkey: string | null;
  }
}
