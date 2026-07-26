import { Router } from "express";
import { createReview } from "../controllers/reviewController";
import { authenticate } from "../middlewares/authMiddleware";
import { authorize } from "../middlewares/roleMiddleware";

const router = Router();

router.post("/", authenticate, authorize("CUSTOMER"), createReview);

export default router;