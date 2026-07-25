import { Request, Response } from "express";
import prisma from "../config/prisma";
import { createRentalSchema } from "../validations/rentalValidation";
import { successResponse, errorResponse } from "../utils/response";

// CUSTOMER: Create a new rental order
export const createRental = async (req: Request, res: Response) => {
  try {
    const parsed = createRentalSchema.safeParse(req.body);
    if (!parsed.success) {
      return errorResponse(res, 400, "Validation failed", parsed.error.flatten().fieldErrors);
    }

    const customerId = req.user?.id as string;
    const { startDate, endDate, items } = parsed.data;

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (end <= start) {
      return errorResponse(res, 400, "End date must be after start date");
    }

    const rentalDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));

    // Fetch all gear items involved
    const gearIds = items.map((item) => item.gearItemId);
    const gearItems = await prisma.gearItem.findMany({
      where: { id: { in: gearIds } },
    });

    if (gearItems.length !== gearIds.length) {
      return errorResponse(res, 404, "One or more gear items not found");
    }

    // Check availability and stock
    for (const item of items) {
      const gear = gearItems.find((g) => g.id === item.gearItemId);
      if (!gear) continue;

      if (!gear.isAvailable) {
        return errorResponse(res, 400, `${gear.name} is not available`);
      }
      if (gear.stock < item.quantity) {
        return errorResponse(res, 400, `${gear.name} does not have enough stock`);
      }
    }

    // Calculate total amount
    let totalAmount = 0;
    for (const item of items) {
      const gear = gearItems.find((g) => g.id === item.gearItemId)!;
      totalAmount += gear.pricePerDay * item.quantity * rentalDays;
    }

    // Create rental order with items in a transaction
    const rentalOrder = await prisma.rentalOrder.create({
      data: {
        customerId,
        startDate: start,
        endDate: end,
        totalAmount,
        items: {
          create: items.map((item) => {
            const gear = gearItems.find((g) => g.id === item.gearItemId)!;
            return {
              gearItemId: item.gearItemId,
              quantity: item.quantity,
              pricePerDay: gear.pricePerDay,
            };
          }),
        },
      },
      include: {
        items: { include: { gearItem: true } },
      },
    });

    return successResponse(res, 201, "Rental order created successfully", rentalOrder);
  } catch (error) {
    return errorResponse(res, 500, "Something went wrong", error);
  }
};

// Get logged-in user's rental orders (customer sees own, provider sees orders for their gear)
export const getMyRentals = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id as string;
    const role = req.user?.role;

    let rentals;

    if (role === "CUSTOMER") {
      rentals = await prisma.rentalOrder.findMany({
        where: { customerId: userId },
        include: {
          items: { include: { gearItem: true } },
          payment: true,
        },
        orderBy: { createdAt: "desc" },
      });
    } else {
      // For providers/admins viewing all isn't handled here (separate provider order route later)
      rentals = await prisma.rentalOrder.findMany({
        where: { customerId: userId },
        include: {
          items: { include: { gearItem: true } },
          payment: true,
        },
        orderBy: { createdAt: "desc" },
      });
    }

    return successResponse(res, 200, "Rental orders fetched successfully", rentals);
  } catch (error) {
    return errorResponse(res, 500, "Something went wrong", error);
  }
};

// Get single rental order details
export const getRentalById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id as string;

    const rental = await prisma.rentalOrder.findUnique({
      where: { id },
      include: {
        items: { include: { gearItem: true } },
        payment: true,
        customer: { select: { id: true, name: true, email: true } },
      },
    });

    if (!rental) {
      return errorResponse(res, 404, "Rental order not found");
    }

    // Only the customer who owns it can view it (for now)
    if (rental.customerId !== userId) {
      return errorResponse(res, 403, "You do not have access to this rental order");
    }

    return successResponse(res, 200, "Rental order fetched successfully", rental);
  } catch (error) {
    return errorResponse(res, 500, "Something went wrong", error);
  }
};

// PROVIDER: Get incoming orders for provider's gear
export const getProviderOrders = async (req: Request, res: Response) => {
  try {
    const providerId = req.user?.id as string;

    const rentals = await prisma.rentalOrder.findMany({
      where: {
        items: {
          some: {
            gearItem: { providerId },
          },
        },
      },
      include: {
        items: { include: { gearItem: true } },
        customer: { select: { id: true, name: true, email: true } },
        payment: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return successResponse(res, 200, "Provider orders fetched successfully", rentals);
  } catch (error) {
    return errorResponse(res, 500, "Something went wrong", error);
  }
};

// PROVIDER: Update rental order status
export const updateRentalStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const providerId = req.user?.id as string;

    const validStatuses = ["CONFIRMED", "PICKED_UP", "RETURNED", "CANCELLED"];
    if (!status || !validStatuses.includes(status)) {
      return errorResponse(res, 400, "Invalid status value", {
        status: `Status must be one of: ${validStatuses.join(", ")}`,
      });
    }

    const rental = await prisma.rentalOrder.findUnique({
      where: { id },
      include: { items: { include: { gearItem: true } } },
    });

    if (!rental) {
      return errorResponse(res, 404, "Rental order not found");
    }

    const ownsOrder = rental.items.some((item) => item.gearItem.providerId === providerId);
    if (!ownsOrder) {
      return errorResponse(res, 403, "You do not have permission to update this order");
    }

    const updated = await prisma.rentalOrder.update({
      where: { id },
      data: { status },
    });

    return successResponse(res, 200, "Rental order status updated successfully", updated);
  } catch (error) {
    return errorResponse(res, 500, "Something went wrong", error);
  }
};