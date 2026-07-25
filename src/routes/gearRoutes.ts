import { Router } from "express";
import { getAllGear, getGearById } from "../controllers/gearController";

const router = Router();

router.get("/", getAllGear);
router.get("/:id", getGearById);

export default router;