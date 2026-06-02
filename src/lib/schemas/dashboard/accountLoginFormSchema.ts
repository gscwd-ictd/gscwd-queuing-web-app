import { z } from 'zod';

// export const accountLoginFormSchema = z.object({
//   email: z.email("Please enter a valid email address"),
//   password: z.string().min(8, "Password must be at least 8 characters long"),
//   counterId: z.string().optional(),
// });

export const accountLoginFormSchema = z
  .object({
    email: z.email('Invalid email address'),
    password: z.string().min(1, 'Password is required'),
    transactionId: z.string().optional(),
    counterId: z.string().optional(),
  })
  .refine((data) => {
    // If user has queuing route, both transaction and counter are required
    if (data.email && data.email.includes('@gscwd.com')) {
      // This will be dynamically validated based on user's role/routes
      return true;
    }
    return true;
  });
