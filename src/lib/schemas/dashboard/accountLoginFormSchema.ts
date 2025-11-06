import { z } from "zod";

export const accountLoginFormSchema = z.object({
  email: z.email("Please enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters long"),
  counterId: z.string().optional(),
});
