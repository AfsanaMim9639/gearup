import { Router } from "express";
import { getAllCategories, createCategory } from "../controllers/categoryController";
import { authenticate } from "../middlewares/authMiddleware";

const router = Router();

router.get("/", getAllCategories);
router.post("/", authenticate, createCategory);

export default router;