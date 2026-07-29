import { Router } from "express";
import { Request, Response, NextFunction } from "express";
import { getDb } from "../firebase/admin";
import { leaderboardEntrySchema } from "../validators/schemas";
import { authenticate, requireAdmin } from "../middlewares/auth";
import { FieldValue } from "firebase-admin/firestore";

const router = Router();

router.get("/", async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const snap = await getDb().collection("leaderboard").orderBy("rank").get();
    res.json({ leaderboard: snap.docs.map((d) => ({ id: d.id, ...d.data() })) });
  } catch (err) { next(err); }
});

router.post("/", authenticate, requireAdmin, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = leaderboardEntrySchema.parse(req.body);
    await getDb().collection("leaderboard").add({ ...data, updatedAt: FieldValue.serverTimestamp() });
    res.status(201).json({ success: true });
  } catch (err) { next(err); }
});

router.put("/:id", authenticate, requireAdmin, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = leaderboardEntrySchema.partial().parse(req.body);
    await getDb().collection("leaderboard").doc(req.params.id).update({ ...data, updatedAt: FieldValue.serverTimestamp() });
    res.json({ success: true });
  } catch (err) { next(err); }
});

router.delete("/:id", authenticate, requireAdmin, async (req: Request, res: Response, next: NextFunction) => {
  try {
    await getDb().collection("leaderboard").doc(req.params.id).delete();
    res.json({ success: true });
  } catch (err) { next(err); }
});

export default router;
