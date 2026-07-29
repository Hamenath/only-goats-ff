import { BaseRepository } from "./base.repository";
import { admin } from "../firebase/admin";

export interface Match {
  id?: string;
  date: string;
  time: string;
  match: string;
  status: "upcoming" | "live" | "completed";
  stage: string;
  teams?: { t1: string; t2: string };
  streamUrl?: string;
  createdAt?: any;
}

export class MatchRepository extends BaseRepository<Match> {
  constructor() {
    super("schedule");
  }

  async getMatchesOrdered(): Promise<Match[]> {
    const snap = await this.collection.orderBy("date").get();
    return snap.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Match));
  }
}
export default MatchRepository;
