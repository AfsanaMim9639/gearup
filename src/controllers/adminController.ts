import { Request, Response } from "express";
import prisma from "../config/prisma";
import { successResponse, errorResponse } from "../utils/response";

// ADMIN: Get all users
export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return successResponse(res, 200, "Users fetched successfully", users);
  } catch (error) {
    return errorResponse(res, 500, "Something went wrong", error);
  }
};

// ADMIN: Update user status (suspend/activate)
export const updateUserStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params as { id: string };
    const { status } = req.body;

    const validStatuses = ["active", "suspended"];
    if (!status || !validStatuses.includes(status)) {
      return errorResponse(res, 400, "Invalid status value", {
        status: `Status must be one of: ${validStatuses.join(", ")}`,
      });
    }

    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
      return errorResponse(res, 404, "User not found");
    }

    const updated = await prisma.user.update({
      where: { id },
      data: { status },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
      },
    });

    return successResponse(res, 200, "User status updated successfully", updated);
  } catch (error) {
    return errorResponse(res, 500, "Something went wrong", error);
  }
};

// ADMIN: Get all gear listings
export const getAllGearAdmin = async (req: Request, res: Response) => {
  try {
    const gearItems = await prisma.gearItem.findMany({
      include: {
        category: true,
        provider: { select: { id: true, name: true, email: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return successResponse(res, 200, "Gear items fetched successfully", gearItems);
  } catch (error) {
    return errorResponse(res, 500, "Something went wrong", error);
  }
};

// ADMIN: Get all rental orders
export const getAllRentalsAdmin = async (req: Request, res: Response) => {
  try {
    const rentals = await prisma.rentalOrder.findMany({
      include: {
        customer: { select: { id: true, name: true, email: true } },
        items: { include: { gearItem: true } },
        payment: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return successResponse(res, 200, "Rental orders fetched successfully", rentals);
  } catch (error) {
    return errorResponse(res, 500, "Something went wrong", error);
  }
};