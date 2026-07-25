import { Router } from "express";
import {
  createGear,
  updateGear,
  deleteGear,
  getProviderGear,
} from "../controllers/gearController";
import { authenticate } from "../middlewares/authMiddleware";
import { authorize } from "../middlewares/roleMiddleware";

const router = Router();

router.use(authenticate, authorize("PROVIDER"));

router.post("/gear", createGear);
router.put("/gear/:id", updateGear);
router.delete("/gear/:id", deleteGear);
router.get("/gear", getProviderGear);

export default router;