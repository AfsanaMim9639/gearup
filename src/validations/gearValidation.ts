import { z } from "zod";

export const createGearSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  description: z.string().min(5, "Description must be at least 5 characters"),
  brand: z.string().min(1, "Brand is required"),
  pricePerDay: z.number().positive("Price must be a positive number"),
  stock: z.number().int().min(1, "Stock must be at least 1"),
  categoryId: z.string().uuid("Invalid category ID"),
  imageUrl: z.string().url("Invalid image URL").optional(),
});

export const updateGearSchema = createGearSchema.partial();