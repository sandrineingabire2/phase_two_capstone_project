import { z } from "zod";

export const signupSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Valid email required"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  bio: z.string().max(280, "Bio must be under 280 characters").optional().or(z.literal("")),
  avatarUrl: z
    .string()
    .url("Provide a valid URL")
    .optional()
    .or(z.literal("")),
});

export const loginSchema = z.object({
  email: z.string().email("Valid email required"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export const profileSchema = z.object({
  bio: z.string().max(280, "Bio must be under 280 characters").optional().or(z.literal("")),
  avatarUrl: z
    .string()
    .url("Provide a valid URL")
    .optional()
    .or(z.literal("")),
});
