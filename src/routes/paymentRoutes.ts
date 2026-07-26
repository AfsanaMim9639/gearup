import { Router } from "express";
import {
  createPaymentIntent,
  confirmPayment,
  getMyPayments,
  getPaymentById,
} from "../controllers/paymentController";
import { authenticate } from "../middlewares/authMiddleware";

const router = Router();

router.use(authenticate);

router.post("/create", createPaymentIntent);
router.post("/confirm", confirmPayment);
router.get("/", getMyPayments);
router.get("/:id", getPaymentById);

export default router;