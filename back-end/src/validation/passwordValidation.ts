import { z } from "zod";

// Register DTO schema
export const resetPasswordSchema = z.object({
    email: z.string().email("Invalid email address"),
    newPassword: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Za-z]/, "Password must contain at least one letter")
      .regex(/[0-9]/, "Password must contain at least one number")
  });
  
  export type ResetPasswordDTO = z.infer<typeof resetPasswordSchema>;
  
