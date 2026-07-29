import { getDb } from "../firebase/admin";
import { logger } from "../utils/logger";

export async function seedDatabase() {
  try {
    const db = getDb();
    logger.info("Starting database seeding...");

    // 1. Settings Collection
    const settingsRef = db.collection("settings").doc("tournament");
    await settingsRef.set({
      registrationOpen: true,
      maxTeams: 24,
      registeredTeams: 0,
      countdownDate: "2026-08-15T19:00:00",
      entryFee: 100,
      reEntryFee: 40,
      prizePool: 1000
    }, { merge: true });
    logger.info("✅ Seeded settings/tournament");

    // 2. Sample Admin Account Placeholder
    const adminRef = db.collection("admins").doc("placeholder-admin-uid");
    await adminRef.set({
      email: "admin@onlygoats.com",
      role: "superadmin",
      createdAt: new Date().toISOString()
    }, { merge: true });
    logger.info("✅ Seeded admins placeholder");

    // 3. Match Schedule Collection
    const scheduleRef = db.collection("schedule");
    const existingMatches = await scheduleRef.limit(1).get();
    if (existingMatches.empty) {
      const demoMatches = [
        {
          date: "15 Aug",
          time: "7:00 PM",
          match: "Qualifier Match 1 — Bermuda",
          status: "upcoming",
          stage: "Stage 1",
          teams: { t1: "12 SQUADS" }
        },
        {
          date: "15 Aug",
          time: "8:00 PM",
          match: "Qualifier Match 2 — Bermuda",
          status: "upcoming",
          stage: "Stage 1",
          teams: { t1: "12 SQUADS" }
        },
        {
          date: "16 Aug",
          time: "7:00 PM",
          match: "CS League — Round Robin",
          status: "upcoming",
          stage: "League Stage",
          teams: { t1: "TOP 6 SQUADS" }
        }
      ];
      for (const m of demoMatches) {
        await scheduleRef.add(m);
      }
      logger.info("✅ Seeded schedule collection with demo matches");
    }

    // 4. Announcements Collection
    const announcementRef = db.collection("announcements");
    const existingAnnouncements = await announcementRef.limit(1).get();
    if (existingAnnouncements.empty) {
      await announcementRef.add({
        title: "Registration Open",
        description: "Registration is now live. Limit of 24 squads only!",
        priority: "high",
        createdAt: new Date().toISOString()
      });
      logger.info("✅ Seeded announcements collection");
    }

    // 5. Leaderboard Collection
    const leaderboardRef = db.collection("leaderboard");
    const existingLeaderboard = await leaderboardRef.limit(1).get();
    if (existingLeaderboard.empty) {
      const demoEntries = [
        { teamName: "Goat Esports", kills: 24, placement: 1, points: 36, wins: 2 },
        { teamName: "Vortex Gaming", kills: 18, placement: 2, points: 26, wins: 1 },
        { teamName: "Apex Predators", kills: 12, placement: 3, points: 18, wins: 0 }
      ];
      for (const entry of demoEntries) {
        await leaderboardRef.add(entry);
      }
      logger.info("✅ Seeded leaderboard collection");
    }

    logger.info("🎉 Database seeding completed successfully!");
  } catch (err: any) {
    logger.error("❌ Seeding failed: " + err.message);
  }
}

// If run directly
if (require.main === module) {
  seedDatabase().then(() => process.exit(0)).catch(() => process.exit(1));
}
