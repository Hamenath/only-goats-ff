import { z } from "zod";

export const playerSchema = z.object({
  name: z.string().min(2),
  uid: z.string().min(8).max(11),
  gameName: z.string().min(2),
});

export const registrationSchema = z.object({
  teamName: z.string().min(2).max(30),
  captain: playerSchema,
  players: z.array(playerSchema).length(3),
  substitute: z.object({
    name: z.string().optional(),
    uid: z.string().refine((val) => !val || (val.trim().length >= 8 && val.trim().length <= 11)).optional(),
    gameName: z.string().optional(),
  }).optional(),
  phone: z.string().regex(/^[6-9]\d{9}$/),
  whatsapp: z.string().regex(/^[6-9]\d{9}$/),
  upiTransactionId: z.string().min(6),
  paymentScreenshotUrl: z.string().url(),
});

export const leaderboardEntrySchema = z.object({
  teamId: z.string(),
  teamName: z.string(),
  rank: z.number().int().positive(),
  kills: z.number().int().min(0),
  points: z.number().int().min(0),
  wins: z.number().int().min(0),
  placement: z.string(),
});

export const scheduleMatchSchema = z.object({
  date: z.string(),
  time: z.string(),
  match: z.string(),
  status: z.enum(["upcoming", "live", "completed"]),
  stage: z.string(),
});

export const announcementSchema = z.object({
  title: z.string().min(3),
  body: z.string().min(10),
  pinned: z.boolean().optional().default(false),
});

export const settingsSchema = z.object({
  tournamentDate: z.string().optional(),
  registrationLimit: z.number().int().positive().optional(),
  registrationEnabled: z.boolean().optional(),
  prizePool: z.number().positive().optional(),
  entryFee: z.number().positive().optional(),
  reEntry: z.number().positive().optional(),
});
