import { Router, Request, Response, NextFunction } from "express";
import { getDb } from "../firebase/admin";
import { scheduleMatchSchema } from "../validators/schemas";
import { authenticate, requireAdmin } from "../middlewares/auth";
import { FieldValue } from "firebase-admin/firestore";

const router = Router();

router.get("/", async (_req, res: Response, next: NextFunction) => {
  try {
    const snap = await getDb().collection("schedule").orderBy("date").get();
    res.json({ schedule: snap.docs.map((d) => ({ id: d.id, ...d.data() })) });
  } catch (err) { next(err); }
});

router.post("/", authenticate, requireAdmin, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = scheduleMatchSchema.parse(req.body);
    const ref = await getDb().collection("schedule").add({ ...data, createdAt: FieldValue.serverTimestamp() });
    res.status(201).json({ success: true, id: ref.id });
  } catch (err) { next(err); }
});

router.put("/:id", authenticate, requireAdmin, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = scheduleMatchSchema.partial().parse(req.body);
    await getDb().collection("schedule").doc(req.params.id).update(data);
    res.json({ success: true });
  } catch (err) { next(err); }
});

router.delete("/:id", authenticate, requireAdmin, async (req: Request, res: Response, next: NextFunction) => {
  try {
    await getDb().collection("schedule").doc(req.params.id).delete();
    res.json({ success: true });
  } catch (err) { next(err); }
});

export default router;
