import env from "./config/env";
import express from "express";
import helmet from "helmet";
import compression from "compression";
import cors from "cors";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import { errorHandler } from "./middlewares/errorHandler";
import { logger } from "./utils/logger";
import { sendResponse } from "./utils/response";
import registrationRoutes from "./routes/registration.routes";
import leaderboardRoutes from "./routes/leaderboard.routes";
import settingsRoutes from "./routes/settings.routes";
import scheduleRoutes from "./routes/schedule.routes";
import announcementRoutes from "./routes/announcement.routes";
import analyticsRoutes from "./routes/analytics.routes";
import uploadRoutes from "./routes/upload.routes";

const app = express();
const PORT = env.PORT;

// Security middlewares
app.use(helmet({
  crossOriginEmbedderPolicy: false,
  contentSecurityPolicy: false,
}));
app.use(compression());
app.use(cors({
  origin: [env.FRONTEND_URL],
  credentials: true,
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  max: env.RATE_LIMIT_MAX,
  message: {
    success: false,
    message: "Too many requests, please try again later.",
    data: null,
    pagination: null,
    timestamp: new Date().toISOString(),
  },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

// Body parsing
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// Logging
app.use(morgan("combined", { stream: { write: (msg) => logger.info(msg.trim()) } }));

// Health check
app.get("/health", (_req, res) => {
  sendResponse({
    res,
    message: "System health check operational",
    data: { status: "ok", service: "only-goats-ff-api" },
  });
});

// Routes
app.use("/api/registrations", registrationRoutes);
app.use("/api/register", registrationRoutes);
app.use("/api/teams", registrationRoutes);
app.use("/api/leaderboard", leaderboardRoutes);
app.use("/api/settings", settingsRoutes);
app.use("/api/schedule", scheduleRoutes);
app.use("/api/matches", scheduleRoutes);
app.use("/api/results", scheduleRoutes);
app.use("/api/announcements", announcementRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/dashboard", analyticsRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/payments", uploadRoutes);

// 404
app.use("*", (_req, res) => {
  res.status(404).json({
    success: false,
    message: "Requested API endpoint route not found",
    data: null,
    pagination: null,
    timestamp: new Date().toISOString(),
  });
});

// Error handler
app.use(errorHandler);

app.listen(PORT, () => {
  logger.info(`🚀 Only Goats FF API running on http://localhost:${PORT}`);
});

export default app;
