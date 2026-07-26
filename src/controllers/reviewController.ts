import { Request, Response } from "express";
import prisma from "../config/prisma";
import { createReviewSchema } from "../validations/reviewValidation";
import { successResponse, errorResponse } from "../utils/response";

// CUSTOMER: Create a review (only after returning the gear)
export const createReview = async (req: Request, res: Response) => {
  try {
    const parsed = createReviewSchema.safeParse(req.body);
    if (!parsed.success) {
      return errorResponse(res, 400, "Validation failed", parsed.error.flatten().fieldErrors);
    }

    const customerId = req.user?.id as string;
    const { gearItemId, rating, comment } = parsed.data;

    // Check the customer actually rented this gear and returned it
    const returnedRental = await prisma.rentalOrder.findFirst({
      where: {
        customerId,
        status: "RETURNED",
        items: {
          some: { gearItemId },
        },
      },
    });

    if (!returnedRental) {
      return errorResponse(
        res,
        403,
        "You can only review gear after renting and returning it"
      );
    }

    const review = await prisma.review.create({
      data: {
        customerId,
        gearItemId,
        rating,
        comment,
      },
    });

    return successResponse(res, 201, "Review created successfully", review);
  } catch (error) {
    return errorResponse(res, 500, "Something went wrong", error);
  }
};