import { Router, Response, NextFunction } from "express";
import { getDb } from "../firebase/admin";
import { authenticate, requireAdmin } from "../middlewares/auth";

const router = Router();

router.get("/", authenticate, requireAdmin, async (_req, res: Response, next: NextFunction) => {
  try {
    const db = getDb();
    const [regsSnap, countSnap, leaderboardSnap] = await Promise.all([
      db.collection("registrations").get(),
      db.collection("settings").doc("registrationCount").get(),
      db.collection("leaderboard").get(),
    ]);

    const regs = regsSnap.docs.map((d) => d.data());
    const pending = regs.filter((r) => r.status === "pending").length;
    const approved = regs.filter((r) => r.status === "approved").length;
    const rejected = regs.filter((r) => r.status === "rejected").length;

    res.json({
      totalRegistrations: regsSnap.size,
      registrationCount: countSnap.data()?.count || 0,
      pending,
      approved,
      rejected,
      leaderboardEntries: leaderboardSnap.size,
    });
  } catch (err) { next(err); }
});

export default router;
