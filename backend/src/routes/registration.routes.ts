import { Router } from "express";
import {
  createRegistration,
  getRegistrations,
  updateRegistrationStatus,
  deleteRegistration,
} from "../controllers/registration.controller";
import { authenticate, requireAdmin } from "../middlewares/auth";

const router = Router();

router.post("/", createRegistration);
router.get("/", authenticate, requireAdmin, getRegistrations);
router.patch("/:id/status", authenticate, requireAdmin, updateRegistrationStatus);
router.delete("/:id", authenticate, requireAdmin, deleteRegistration);

export default router;
