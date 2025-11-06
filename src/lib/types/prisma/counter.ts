import { QueuingTicket } from "./queuingTicket";

export type Counter = {
  id: string;
  name: string;
  code: string;
  transactionId: string;
  departmentId: string;
  dateCreated: Date;
  dateUpdated: Date;
};

export type CounterWithTicket = Partial<Counter> & {
  queuingTicket: Partial<QueuingTicket>;
};
