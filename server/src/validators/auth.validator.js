import { z } from 'zod';

export const registerSchema = {
  body: z
    .object({
      name: z.string().min(2, 'Name must be at least 2 characters').max(60),
      email: z.string().email('Invalid email address').toLowerCase().trim(),
      password: z
        .string()
        .min(6, 'Password must be at least 6 characters')
        .max(100),
      confirmPassword: z.string().min(6),
      department: z.string().optional().nullable(),
      semester: z.coerce.number().min(1).max(8).optional().nullable(),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: "Passwords do not match",
      path: ['confirmPassword'],
    }),
};

export const loginSchema = {
  body: z.object({
    email: z.string().email('Invalid email address').toLowerCase().trim(),
    password: z.string().min(1, 'Password is required'),
    rememberMe: z.boolean().optional(),
  }),
};

export const forgotPasswordSchema = {
  body: z.object({
    email: z.string().email('Invalid email address').toLowerCase().trim(),
  }),
};

export const resetPasswordSchema = {
  body: z
    .object({
      token: z.string().min(1, 'Reset token is required'),
      password: z.string().min(6, 'Password must be at least 6 characters').max(100),
      confirmPassword: z.string().min(6),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: "Passwords do not match",
      path: ['confirmPassword'],
    }),
};
