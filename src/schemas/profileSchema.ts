import { z } from "zod";

export const profileSchema = z.object({
  // Basic Identity
  name: z.string().min(2, "Name must be at least 2 characters").max(100),
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(30, "Username must be less than 30 characters")
    .regex(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers, and underscores")
    .optional()
    .or(z.literal("")),
  email: z.string().email("Invalid email address"),
  phone_number: z
    .string()
    .regex(/^\+?[\d\s\-()]+$/, "Invalid phone number format")
    .optional()
    .or(z.literal("")),
  bio: z.string().max(500, "Bio must be less than 500 characters").optional().or(z.literal("")),
  date_of_birth: z
    .string()
    .optional()
    .nullable()
    .refine(
      (date) => {
        if (!date) return true;
        const birthDate = new Date(date);
        const age = new Date().getFullYear() - birthDate.getFullYear();
        return age >= 13;
      },
      "You must be at least 13 years old"
    ),
  gender: z.enum(["male", "female", "other", "prefer_not_to_say", ""]).optional().nullable(),

  // Contact & Location
  address_line1: z.string().max(200).optional().or(z.literal("")),
  address_line2: z.string().max(200).optional().or(z.literal("")),
  city: z.string().max(100).optional().or(z.literal("")),
  state: z.string().max(100).optional().or(z.literal("")),
  postal_code: z.string().max(20).optional().or(z.literal("")),
  country: z.string().max(100).optional().or(z.literal("")),
  timezone: z.string().optional().or(z.literal("")),
  language_preference: z.string().max(10).optional().or(z.literal("")),

  // Business
  company_name: z.string().max(100).optional().or(z.literal("")),
  job_title: z.string().max(100).optional().or(z.literal("")),
  industry: z.string().max(100).optional().or(z.literal("")),
  website_url: z
    .string()
    .url("Must be a valid URL")
    .optional()
    .or(z.literal("")),
  linkedin_url: z
    .string()
    .url("Must be a valid URL")
    .refine(
      (url) => !url || url.includes("linkedin.com"),
      "Must be a LinkedIn URL"
    )
    .optional()
    .or(z.literal("")),
});

export type ProfileFormData = z.infer<typeof profileSchema>;
