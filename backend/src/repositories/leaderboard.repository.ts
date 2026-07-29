import { BaseRepository } from "./base.repository";
import { admin } from "../firebase/admin";

export interface LeaderboardEntry {
  id?: string;
  teamId: string;
  teamName: string;
  rank: number;
  kills: number;
  points: number;
  wins: number;
  placement: string;
  updatedAt?: any;
}

export class LeaderboardRepository extends BaseRepository<LeaderboardEntry> {
  constructor() {
    super("leaderboard");
  }

  async getLeaderboardSorted(): Promise<LeaderboardEntry[]> {
    const snap = await this.collection.orderBy("rank").get();
    return snap.docs.map((doc) => ({ id: doc.id, ...doc.data() } as LeaderboardEntry));
  }

  async updateStats(id: string, kills: number, wins: number, points: number, placement: string): Promise<void> {
    await this.update(id, {
      kills,
      wins,
      points,
      placement,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
  }
}
export default LeaderboardRepository;
