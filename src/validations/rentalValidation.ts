import { z } from "zod";

export const createRentalSchema = z.object({
  startDate: z.string().datetime("Invalid start date"),
  endDate: z.string().datetime("Invalid end date"),
  items: z
    .array(
      z.object({
        gearItemId: z.string().uuid("Invalid gear item ID"),
        quantity: z.number().int().positive("Quantity must be at least 1"),
      })
    )
    .min(1, "At least one item is required"),
});