import { z } from "zod";

export const step1Schema = z.object({
  isPrioritized: z.boolean().optional(),
  transaction: z.object({
    id: z.string().nonempty({ message: "Please select a transaction" }),
  }),
});
