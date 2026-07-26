import { Router } from "express";
import {
  getAllUsers,
  updateUserStatus,
  getAllGearAdmin,
  getAllRentalsAdmin,
} from "../controllers/adminController";
import { authenticate } from "../middlewares/authMiddleware";
import { authorize } from "../middlewares/roleMiddleware";

const router = Router();

router.use(authenticate, authorize("ADMIN"));

router.get("/users", getAllUsers);
router.patch("/users/:id", updateUserStatus);
router.get("/gear", getAllGearAdmin);
router.get("/rentals", getAllRentalsAdmin);

export default router;