import { Router, Request, Response, NextFunction } from "express";
import { getDb } from "../firebase/admin";
import { settingsSchema } from "../validators/schemas";
import { authenticate, requireAdmin } from "../middlewares/auth";

const router = Router();

router.get("/", async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const snap = await getDb().collection("settings").doc("tournament").get();
    res.json(snap.data() || {});
  } catch (err) { next(err); }
});

router.patch("/", authenticate, requireAdmin, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = settingsSchema.partial().parse(req.body);
    await getDb().collection("settings").doc("tournament").set(data, { merge: true });
    res.json({ success: true });
  } catch (err) { next(err); }
});

export default router;
