import { z } from "zod";

// Define validation schemas
export const loginSchema = z.object({
  login_email: z.string().email("Please enter a valid email address"),
  login_password: z.string().min(8, "Password must be at least 8 characters").max(24, "Password is too long"),
});

export const registerSchema = z
  .object({
    first_name: z.string().min(1, "First name is required"),
    last_name: z.string().min(1, "Last name is required"),
    register_email: z.string().email("Please enter a valid email address"),
    register_password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .max(24, "Password is too long")
      .regex(
        /(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@#$!%*?^&+=])/,
        "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character",
      ),
    register_repeat_password: z.string(),
  })
  .refine((data) => data.register_password === data.register_repeat_password, {
    message: "Passwords do not match",
    path: ["register_repeat_password"],
  });

export const resetEmailSchema = z.object({
  reset_email: z.string().email("Please enter a valid email address"),
});

export const resetPasswordSchema = z
  .object({
    reset_password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .max(24, "Password is too long")
      .regex(
        /(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@#$!%*?^&+=])/,
        "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character",
      ),
    reset_repeat_password: z.string(),
  })
  .refine((data) => data.reset_password === data.reset_repeat_password, {
    message: "Passwords do not match",
    path: ["reset_repeat_password"],
  });

// Define types based on schemas
export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;
export type ResetEmailFormData = z.infer<typeof resetEmailSchema>;
export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;
