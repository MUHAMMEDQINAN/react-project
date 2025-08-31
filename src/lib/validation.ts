import { z } from "zod";

export const registrationSchema = z.object({
  icpId: z.string()
    .min(1, "ICP ID is required")
    .regex(/^ICP\d{6}$/, "ICP ID must be in format ICP followed by 6 digits"),
  streetAddress: z.string()
    .min(1, "Street address is required")
    .min(5, "Street address must be at least 5 characters"),
  town: z.string()
    .min(1, "Town is required")
    .min(2, "Town must be at least 2 characters"),
  region: z.string()
    .min(1, "Region is required")
});

export const authenticationSchema = z
  .object({
    email: z.string().email("Invalid email address"),
    mobile: z.string().min(8, "Mobile number must be at least 8 digits"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[a-z]/, "Must contain at least one lowercase letter")
      .regex(/[A-Z]/, "Must contain at least one uppercase letter")
      .regex(/\d/, "Must contain at least one number")
      .regex(/[@$!%*?&]/, "Must contain at least one special character"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"], // error goes to confirmPassword
  });

export const otpSchema = z.object({
  otp: z.string()
    .min(1, "OTP is required")
    .length(6, "OTP must be exactly 6 digits")
    .regex(/^\d{6}$/, "OTP must contain only numbers")
});

export type RegistrationFormData = z.infer<typeof registrationSchema>;
export type AuthenticationFormData = z.infer<typeof authenticationSchema>;
export type OTPFormData = z.infer<typeof otpSchema>;