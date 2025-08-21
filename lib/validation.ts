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

export const authenticationSchema = z.object({
  email: z.string()
    .min(1, "Email is required")
    .email("Please enter a valid email address"),
  mobile: z.string()
    .min(1, "Mobile number is required")
    .regex(/^(\+64|0)[0-9]{8,9}$/, "Please enter a valid New Zealand mobile number"),
  password: z.string()
    .min(1, "Password is required")
    .min(8, "Password must be at least 8 characters")
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, 
           "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character")
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