import z, { object, string } from "zod"

export const signInSchema = object({
  email: string({ error: "Email is required" })
    .min(1, "Email is required")
    .email("Invalid email"),
  password: string({ error: "Password is required" })
    .min(1, "Password is required")
    .min(8, "Password must be more than 8 characters")
    .max(32, "Password must be less than 32 characters"),
})

export const registerSchema = object({
  firstName: string({ error: "First name is required" })
    .min(1, "First name is required")
    .max(50, "First name must be less than 50 characters"),
  lastName: string({ error: "Last name is required" })
    .min(1, "Last name is required")
    .max(50, "Last name must be less than 50 characters"),
  email: string({ error: "Email is required" })
    .min(1, "Email is required")
    .email("Please enter a valid email address"),
  phone: string()
    .optional()
    .refine((val) => !val || val.length > 0, "Please enter a valid phone number"),
  password: string({ error: "Password is required" })
    .min(8, "Password must be at least 8 characters")
    .max(32, "Password must be less than 32 characters"),
})

export const forgotPasswordSchema = object({
  email: string({ error: "Email is required" })
    .min(1, "Email is required")
    .email("Invalid email"),
})

export const ADD_MEMBER_TITLES = [
  "chairperson",
  "treasurer",
  "secretary",
  "member",
] as const

export const addMemberSchema = object({
  firstName: string().min(1, "First name is required").max(50),
  lastName: string().min(1, "Last name is required").max(50),
  phone: string().min(1, "Phone is required"),
  title: z.enum(ADD_MEMBER_TITLES, {
    message: "Title is required",
  }),
  file: z.instanceof(File, { message: "File is required" })
    .refine((file) => file.type === "application/pdf", "File must be a PDF")
    .refine((file) => file.size <= 4 * 1024 * 1024, "File must not exceed 4 MB"),
})

export type AddMemberFormValues = z.infer<typeof addMemberSchema>

export const GROUP_TYPES = ["EQUALANNUAL", "ROTATIONAL"] as const

export const createGroupSchema = object({
  name: string().min(1, "Group name is required").max(100),
  country: string().min(1, "Country is required").max(100),
  city: string().min(1, "City is required").max(100),
  region: string().min(1, "Region is required").max(100),
  street: string().min(1, "Street address is required").max(255),
  description: string().optional(),
  type: z.enum(GROUP_TYPES, {
    message: "Type is required",
  }),
})

export type CreateGroupFormValues = z.infer<typeof createGroupSchema>

export const CONTRIBUTION_TYPES = ["SAVINGS", "JAMII", "PENALTY"] as const

export const addContributionSchema = object({
  userId: z.coerce.number().min(1, "Please select a member"),
  amount: z.coerce.number()
    .min(1, "Amount must be at least 1")
    .positive("Amount must be a positive number"),
  type: z.enum(CONTRIBUTION_TYPES, {
    message: "Type is required",
  }),
  penaltyId: z.optional(z.coerce.number()),
})

export type AddContributionFormValues = z.infer<typeof addContributionSchema>

export const PENALTY_TYPES = ["ABSENT", "LATE", "MISCONDUCT", "OTHER"] as const

export const addPenaltySchema = object({
  userId: z.coerce.number().min(1, "Please select a member"),
  amount: z.coerce.number()
    .min(1, "Amount must be at least 1")
    .positive("Amount must be a positive number"),
  type: z.enum(PENALTY_TYPES, {
    message: "Please select a penalty type",
  }),
})

export type AddPenaltyFormValues = z.infer<typeof addPenaltySchema>

export const addSharesSchema = object({
  totalShares: z.coerce.number()
    .min(1, "Total shares must be at least 1")
    .int("Total shares must be a whole number"),
  sharePrice: z.coerce.number()
    .min(0.01, "Share price must be greater than 0")
    .positive("Share price must be a positive number"),
})

export type AddSharesFormValues = z.infer<typeof addSharesSchema>

export const sellSharesSchema = object({
  userId: z.coerce.number().min(1, "Please select a member"),
  quantity: z.coerce.number()
    .min(1, "Quantity must be at least 1")
    .int("Quantity must be a whole number"),
})

export type SellSharesFormValues = z.infer<typeof sellSharesSchema>