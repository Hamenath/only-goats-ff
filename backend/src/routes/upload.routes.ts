import { Router, Request, Response, NextFunction } from "express";
import { getBucket } from "../firebase/admin";
import multer from "multer";
import path from "path";
import { v4 as uuidv4 } from "uuid";

const router = Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = [".jpg", ".jpeg", ".png", ".webp"];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowed.includes(ext)) cb(null, true);
    else cb(new Error("Only image files are allowed"));
  },
});

router.post("/payment", upload.single("screenshot"), async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.file) return next(new Error("No file uploaded"));
    const bucket = getBucket();
    const filename = `payments/${uuidv4()}-${req.file.originalname}`;
    const file = bucket.file(filename);
    await file.save(req.file.buffer, {
      metadata: { contentType: req.file.mimetype },
      public: true,
    });
    const url = `https://storage.googleapis.com/${bucket.name}/${filename}`;
    res.json({ url });
  } catch (err) { next(err); }
});

export default router;
