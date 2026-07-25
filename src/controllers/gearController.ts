import { Request, Response } from "express";
import prisma from "../config/prisma";
import { createGearSchema, updateGearSchema } from "../validations/gearValidation";
import { successResponse, errorResponse } from "../utils/response";

// PUBLIC: Get all gear with filters
export const getAllGear = async (req: Request, res: Response) => {
  try {
    const { category, brand, minPrice, maxPrice, available } = req.query;

    const where: any = {};

    if (category) where.categoryId = category as string;
    if (brand) where.brand = { contains: brand as string, mode: "insensitive" };
    if (available !== undefined) where.isAvailable = available === "true";

    if (minPrice || maxPrice) {
      where.pricePerDay = {};
      if (minPrice) where.pricePerDay.gte = parseFloat(minPrice as string);
      if (maxPrice) where.pricePerDay.lte = parseFloat(maxPrice as string);
    }

    const gearItems = await prisma.gearItem.findMany({
      where,
      include: {
        category: true,
        provider: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return successResponse(res, 200, "Gear items fetched successfully", gearItems);
  } catch (error) {
    return errorResponse(res, 500, "Something went wrong", error);
  }
};

// PUBLIC: Get single gear details
export const getGearById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const gearItem = await prisma.gearItem.findUnique({
      where: { id },
      include: {
        category: true,
        provider: { select: { id: true, name: true } },
        reviews: true,
      },
    });

    if (!gearItem) {
      return errorResponse(res, 404, "Gear item not found");
    }

    return successResponse(res, 200, "Gear item fetched successfully", gearItem);
  } catch (error) {
    return errorResponse(res, 500, "Something went wrong", error);
  }
};

// PROVIDER: Add new gear
export const createGear = async (req: Request, res: Response) => {
  try {
    const parsed = createGearSchema.safeParse(req.body);

    if (!parsed.success) {
      return errorResponse(res, 400, "Validation failed", parsed.error.flatten().fieldErrors);
    }

    const providerId = req.user?.id as string;

    const category = await prisma.category.findUnique({
      where: { id: parsed.data.categoryId },
    });
    if (!category) {
      return errorResponse(res, 404, "Category not found");
    }

    const gearItem = await prisma.gearItem.create({
      data: {
        ...parsed.data,
        providerId,
      },
    });

    return successResponse(res, 201, "Gear item created successfully", gearItem);
  } catch (error) {
    return errorResponse(res, 500, "Something went wrong", error);
  }
};

// PROVIDER: Update own gear
export const updateGear = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const providerId = req.user?.id as string;

    const parsed = updateGearSchema.safeParse(req.body);
    if (!parsed.success) {
      return errorResponse(res, 400, "Validation failed", parsed.error.flatten().fieldErrors);
    }

    const gearItem = await prisma.gearItem.findUnique({ where: { id } });
    if (!gearItem) {
      return errorResponse(res, 404, "Gear item not found");
    }

    if (gearItem.providerId !== providerId) {
      return errorResponse(res, 403, "You can only update your own gear");
    }

    const updated = await prisma.gearItem.update({
      where: { id },
      data: parsed.data,
    });

    return successResponse(res, 200, "Gear item updated successfully", updated);
  } catch (error) {
    return errorResponse(res, 500, "Something went wrong", error);
  }
};

// PROVIDER: Delete own gear
export const deleteGear = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const providerId = req.user?.id as string;

    const gearItem = await prisma.gearItem.findUnique({ where: { id } });
    if (!gearItem) {
      return errorResponse(res, 404, "Gear item not found");
    }

    if (gearItem.providerId !== providerId) {
      return errorResponse(res, 403, "You can only delete your own gear");
    }

    await prisma.gearItem.delete({ where: { id } });

    return successResponse(res, 200, "Gear item deleted successfully");
  } catch (error) {
    return errorResponse(res, 500, "Something went wrong", error);
  }
};

// PROVIDER: Get own incoming orders (placeholder for now)
export const getProviderGear = async (req: Request, res: Response) => {
  try {
    const providerId = req.user?.id as string;

    const gearItems = await prisma.gearItem.findMany({
      where: { providerId },
      include: { category: true },
      orderBy: { createdAt: "desc" },
    });

    return successResponse(res, 200, "Your gear items fetched successfully", gearItems);
  } catch (error) {
    return errorResponse(res, 500, "Something went wrong", error);
  }
};