import { z } from "zod";

export const createReviewSchema = z.object({
  gearItemId: z.string().uuid("Invalid gear item ID"),
  rating: z.number().int().min(1, "Rating must be at least 1").max(5, "Rating must be at most 5"),
  comment: z.string().optional(),
});