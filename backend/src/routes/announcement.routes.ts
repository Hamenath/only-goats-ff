import { Router, Request, Response, NextFunction } from "express";
import { getDb } from "../firebase/admin";
import { announcementSchema } from "../validators/schemas";
import { authenticate, requireAdmin } from "../middlewares/auth";
import { FieldValue } from "firebase-admin/firestore";

const router = Router();

router.get("/", async (_req, res: Response, next: NextFunction) => {
  try {
    const snap = await getDb().collection("announcements").orderBy("createdAt", "desc").limit(20).get();
    res.json({ announcements: snap.docs.map((d) => ({ id: d.id, ...d.data() })) });
  } catch (err) { next(err); }
});

router.post("/", authenticate, requireAdmin, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = announcementSchema.parse(req.body);
    const ref = await getDb().collection("announcements").add({ ...data, createdAt: FieldValue.serverTimestamp() });
    res.status(201).json({ success: true, id: ref.id });
  } catch (err) { next(err); }
});

router.delete("/:id", authenticate, requireAdmin, async (req: Request, res: Response, next: NextFunction) => {
  try {
    await getDb().collection("announcements").doc(req.params.id).delete();
    res.json({ success: true });
  } catch (err) { next(err); }
});

export default router;
