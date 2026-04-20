import z, { object, string } from "zod"
import { isValidPhoneNumber } from "libphonenumber-js/min"

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
    .refine(
      (val) => val == null || val === "" || isValidPhoneNumber(val),
      "Please enter a valid phone number"
    ),
  password: string({ error: "Password is required" })
    .min(8, "Password must be at least 8 characters")
    .max(32, "Password must be less than 32 characters"),
})

export const forgotPasswordSchema = object({
  email: string({ error: "Email is required" })
    .min(1, "Email is required")
    .email("Invalid email"),
})

export const resetPasswordSchema = object({
  password: string({ error: "Password is required" })
    .min(1, "Password is required")
    .min(8, "Password must be more than 8 characters")
    .max(32, "Password must be less than 32 characters"),
  confirmPassword: string({ error: "Confirm password is required" })
    .min(1, "Confirm password is required"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
})

export const ADD_MEMBER_TITLES = [
  "chairperson",
  "treasurer",
  "secretary",
  "member",
] as const

const ADD_MEMBER_IMAGE_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/heic",
  "image/heif",
] as const

export const addMemberSchema = object({
  firstName: string().min(1, "First name is required").max(50),
  lastName: string().min(1, "Last name is required").max(50),
  phone: string()
    .min(1, "Phone is required")
    .refine(
      (val) => isValidPhoneNumber(val),
      "Enter a valid international phone number (e.g. +255712345678)"
    ),
  title: z.enum(ADD_MEMBER_TITLES, {
    message: "Title is required",
  }),
  email: string()
    .trim()
    .optional()
    .refine(
      (val) => val == null || val === "" || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val),
      "Please enter a valid email address"
    ),
  file: z
    .instanceof(File)
    .optional()
    .refine((file) => !file || file.type === "application/pdf", "File must be a PDF")
    .refine((file) => !file || file.size <= 4 * 1024 * 1024, "File must not exceed 4 MB"),
  image: z
    .instanceof(File)
    .optional()
    .refine(
      (file) => !file || ADD_MEMBER_IMAGE_MIME_TYPES.includes(file.type as (typeof ADD_MEMBER_IMAGE_MIME_TYPES)[number]),
      "Image must be a JPEG, PNG, WebP, HEIC, or HEIF"
    )
    .refine((file) => !file || file.size <= 4 * 1024 * 1024, "Image must not exceed 4 MB"),
}).superRefine((data, ctx) => {
  const needsEmail =
    data.title === "chairperson" || data.title === "treasurer" || data.title === "secretary"

  if (needsEmail) {
    const email = (data.email ?? "").trim()
    if (email.length === 0) {
      ctx.addIssue({
        code: "custom",
        message: "Email is required",
        path: ["email"],
      })
    }
  }

  if (!data.file && !data.image) {
    ctx.addIssue({
      code: "custom",
      message: "Please upload a PDF document or an image",
      path: ["file"],
    })
  }
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

export const updateGroupSchema = object({
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

export type UpdateGroupFormValues = z.infer<typeof updateGroupSchema>

export const updateMeSchema = object({
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
    .min(1, "Phone is required")
    .refine(
      (val) => isValidPhoneNumber(val),
      "Enter a valid international phone number (e.g. +255712345678)"
    ),
  currentPassword: string().optional(),
  password: string().optional(),
}).superRefine((data, ctx) => {
  const newPwd = data.password?.trim() ?? ""
  const curPwd = data.currentPassword?.trim() ?? ""

  if (newPwd.length > 0) {
    if (curPwd.length === 0) {
      ctx.addIssue({
        code: "custom",
        message: "Current password is required to set a new password",
        path: ["currentPassword"],
      })
    }
    if (newPwd.length < 8) {
      ctx.addIssue({
        code: "custom",
        message: "Password must be at least 8 characters",
        path: ["password"],
      })
    }
    if (newPwd.length > 32) {
      ctx.addIssue({
        code: "custom",
        message: "Password must be less than 32 characters",
        path: ["password"],
      })
    }
  } else if (curPwd.length > 0) {
    ctx.addIssue({
      code: "custom",
      message: "Enter a new password or clear the current password field",
      path: ["password"],
    })
  }
})

export type UpdateMeFormValues = z.infer<typeof updateMeSchema>

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

export const addLoanSchema = object({
  userId: z.coerce.number().min(1, "Please select a member"),
  principal: z.coerce
    .number()
    .min(1, "Principal must be at least 1")
    .positive("Principal must be a positive number"),
  interestRate: z.coerce
    .number()
    .min(0.01, "Interest rate must be greater than 0")
    .max(100, "Interest rate must be at most 100"),
  durationMonths: z.coerce
    .number()
    .int("Duration must be a whole number of months")
    .min(1, "Duration must be at least 1 month"),
  reason: string().max(500, "Reason must be at most 500 characters").optional(),
})

export type AddLoanFormValues = z.infer<typeof addLoanSchema>

export const addMeetingSchema = object({
  meetingDate: string().min(1, "Meeting date is required"),
  nextMeetingDate: string().min(1, "Next meeting date is required"),
  topic: string().min(1, "Meeting topic is required").max(200, "Topic must be at most 200 characters"),
  attendeeIds: z.array(z.number()),
  resolutions: string().max(1000, "Resolutions must be at most 1000 characters").optional(),
})

export type AddMeetingFormValues = z.infer<typeof addMeetingSchema>