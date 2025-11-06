import { QueuingStatus } from "@prisma/client";
import { Counter } from "./counter";
import { Transaction } from "./transaction";
import { User } from "./user";
import { ServiceType } from "./serviceType";

export type QueuingTicket = {
  number: string;
  id: string;
  position: number;
  queuingStatus: QueuingStatus;
  isPrioritized: boolean;
  dateCreated: Date;
  dateUpdated: Date;
  transactionId: string;
  counterId: string | null;
  userId: string | null;
  serviceTypeId: string | null;
  otherServiceType: string | null;
  departmentId: string | null;
  dateTransactionStarted: Date | null;
  dateTransactionEnded: Date | null;
  remarks: string | null;
  transferredBy: string | null;
  transferredTo: string | null;
  timesTicketLapsed: number;
};

export type GeneratedQueuingTicket = Pick<
  QueuingTicket,
  | "id"
  | "number"
  | "position"
  | "queuingStatus"
  | "isPrioritized"
  | "dateCreated"
> & {
  transaction: Partial<Pick<Transaction, "id" | "name" | "code">>;
};

export type TicketWithCounter = GeneratedQueuingTicket & {
  counter: Pick<Counter, "id" | "name" | "code">;
};

export type NowServingTicket = Partial<QueuingTicket> & {
  transaction: Partial<Transaction>;
} & { counter: Pick<Counter, "id" | "name" | "code"> };

export type QueuingTicketReport = {
  tickets: (QueuingTicket & {
    transaction: Transaction;
  } & {
    counter: Counter;
  } & {
    serviceType: ServiceType;
  } & { user: User })[];

  generatedBy: Pick<
    User,
    "firstName" | "middleName" | "lastName" | "nameExtension" | "position"
  >;
  notedBy: {
    supervisor: Pick<
      User,
      "firstName" | "middleName" | "lastName" | "nameExtension" | "position"
    >;
  };
  approvedBy: {
    manager: Pick<
      User,
      "firstName" | "middleName" | "lastName" | "nameExtension" | "position"
    >;
  };
};
