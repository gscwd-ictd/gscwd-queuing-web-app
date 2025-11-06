import {
  NowServingTicket,
  QueuingTicket,
} from "./lib/types/prisma/queuingTicket";

export interface SocketEvents {
  // Client to Server
  authenticate: (userId: string) => void;
  "call-ticket": (data: Partial<QueuingTicket>) => void;
  "ring-bell": (data: Partial<QueuingTicket>) => void;
  "start-transaction": (data: Partial<QueuingTicket>) => void;
  "mark-ticket-as-lapsed": (data: Partial<QueuingTicket>) => void;
  "transfer-ticket": (data: Partial<QueuingTicket>) => void;
  "cancel-ticket": (data: Partial<QueuingTicket>) => void;
  "complete-transaction": (data: Partial<QueuingTicket>) => void;

  // Server to Client
  "ticket-created": (data: GeneratedQueuingTicket) => void;
  "ticket-called": (data: Partial<QueuingTicket>) => void;
  "bell-rang": (data: NowServingTicket) => void;
  "transaction-started": (data: Partial<QueuingTicket>) => void;
  "ticket-marked-as-lapsed": (data: Partial<QueuingTicket>) => void;
  "ticket-transferred": (data: Partial<QueuingTicket>) => void;
  "ticket-cancelled": (data: Partial<QueuingTicket>) => void;
  "transaction-completed": (data: Partial<QueuingTicket>) => void;
}
