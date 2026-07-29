import { Request, Response, NextFunction } from "express";
import { admin, getDb } from "../firebase/admin";
import { AppError } from "./errorHandler";

export async function authenticate(req: Request, _res: Response, next: NextFunction) {
  const token = req.headers.authorization?.split("Bearer ")[1];
  if (!token) return next(new AppError("No auth token", 401));

  try {
    const decoded = await admin.auth().verifyIdToken(token);
    (req as Request & { user?: admin.auth.DecodedIdToken }).user = decoded;
    next();
  } catch {
    next(new AppError("Invalid or expired token", 401));
  }
}

export async function requireAdmin(req: Request, _res: Response, next: NextFunction) {
  const user = (req as Request & { user?: admin.auth.DecodedIdToken }).user;
  if (!user) return next(new AppError("Unauthorized", 401));

  const db = getDb();
  const adminDoc = await db.collection("admins").doc(user.uid).get();
  if (!adminDoc.exists) return next(new AppError("Forbidden — Admin only", 403));
  next();
}
