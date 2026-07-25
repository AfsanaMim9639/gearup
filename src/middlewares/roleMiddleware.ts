import { Request, Response, NextFunction } from "express";
import { errorResponse } from "../utils/response";

export const authorize = (...allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const userRole = req.user?.role;

    if (!userRole || !allowedRoles.includes(userRole)) {
      return errorResponse(
        res,
        403,
        "You do not have permission to access this resource"
      );
    }

    next();
  };
};