import { z } from "zod";

export const createuserSchema = z.object({
  email: z.string().email(),
  name: z.string().min(2),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters long")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).*$/,
      "Password must include at least one lowercase letter, one uppercase letter, one number, and one special character"
    ),
});

export const createProductSchema = z.object({
  name: z.string().min(2),
  description: z.string().optional(),
  price: z.number().positive(),
  stock: z.number().int().nonnegative(),
  category: z.string().optional(),
  imageUrl: z.string().url().optional(),
});

export const createOrderSchema = z.object({
  userId: z.string().uuid(),
  items: z.array(
    z.object({
      productId: z.string().uuid(),
      quantity: z.number().int().positive(),
    })
  ),
});
