import { Router } from "express";
import { createRental, getMyRentals, getRentalById } from "../controllers/rentalController";
import { authenticate } from "../middlewares/authMiddleware";
import { authorize } from "../middlewares/roleMiddleware";

const router = Router();

router.use(authenticate);

router.post("/", authorize("CUSTOMER"), createRental);
router.get("/", getMyRentals);
router.get("/:id", getRentalById);

export default router;