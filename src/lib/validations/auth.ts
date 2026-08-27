/**
 * Zod validation schemas for authentication.
 *
 * Using Zod ensures that every API route validates input the same way,
 * preventing malformed data from reaching your database or auth logic.
 *
 * ⚡ These schemas are shared across register, login, and reset-password routes.
 */

import { z } from 'zod'

/** Registration form: name + email + password + confirm */
export const registerSchema = z
  .object({
    name: z
      .string()
      .min(2, 'Name must be at least 2 characters')
      .max(100, 'Name must be under 100 characters'),
    email: z
      .string()
      .email('Please enter a valid email address')
      .toLowerCase()
      .trim(),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .max(128, 'Password must be under 128 characters'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

/** Login form: email + password */
export const loginSchema = z.object({
  email: z.string().email('Please enter a valid email').toLowerCase().trim(),
  password: z.string().min(1, 'Password is required'),
})

/** Password reset request: email only */
export const resetRequestSchema = z.object({
  email: z.string().email('Please enter a valid email').toLowerCase().trim(),
})

/** Password reset confirmation: token + new password */
export const resetConfirmSchema = z
  .object({
    token: z.string().min(1, 'Reset token is required'),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .max(128, 'Password must be under 128 characters'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

/** Infer TypeScript types from the schemas */
export type RegisterInput = z.infer<typeof registerSchema>
export type LoginInput = z.infer<typeof loginSchema>
export type ResetRequestInput = z.infer<typeof resetRequestSchema>
export type ResetConfirmInput = z.infer<typeof resetConfirmSchema>
