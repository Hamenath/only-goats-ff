import { Router, Request, Response, NextFunction } from "express";
import multer from "multer";
import path from "path";
import crypto from "crypto";

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

    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;

    if (!cloudName || !apiKey || !apiSecret) {
      return next(new Error("Cloudinary credentials missing in server environment"));
    }

    const timestamp = Math.round(new Date().getTime() / 1000).toString();
    const signatureStr = `timestamp=${timestamp}${apiSecret}`;
    const signature = crypto.createHash("sha1").update(signatureStr).digest("hex");

    const uploadFormData = new FormData();
    uploadFormData.append("file", new Blob([req.file.buffer]), req.file.originalname);
    uploadFormData.append("api_key", apiKey);
    uploadFormData.append("timestamp", timestamp);
    uploadFormData.append("signature", signature);

    const cloudinaryRes = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
      method: "POST",
      body: uploadFormData,
    });

    const result = (await cloudinaryRes.json()) as any;
    if (result.error) {
      return next(new Error(result.error.message));
    }

    res.json({ url: result.secure_url });
  } catch (err) { next(err); }
});

export default router;
