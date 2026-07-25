import { Request, Response } from "express";
import prisma from "../config/prisma";
import { successResponse, errorResponse } from "../utils/response";

export const getAllCategories = async (req: Request, res: Response) => {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { name: "asc" },
    });

    return successResponse(
      res,
      200,
      "Categories fetched successfully",
      categories
    );
  } catch (error) {
    return errorResponse(res, 500, "Something went wrong", error);
  }
};

export const createCategory = async (req: Request, res: Response) => {
  try {
    const { name } = req.body;

    if (!name || typeof name !== "string" || name.trim().length < 2) {
      return errorResponse(
        res,
        400,
        "Validation failed",
        { name: "Category name must be at least 2 characters" }
      );
    }

    const existing = await prisma.category.findUnique({ where: { name } });
    if (existing) {
      return errorResponse(res, 409, "Category already exists");
    }

    const category = await prisma.category.create({
      data: { name: name.trim() },
    });

    return successResponse(res, 201, "Category created successfully", category);
  } catch (error) {
    return errorResponse(res, 500, "Something went wrong", error);
  }
};