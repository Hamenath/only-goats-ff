import { BaseRepository } from "./base.repository";
import { admin } from "../firebase/admin";
import { AppError } from "../middlewares/errorHandler";

interface Player {
  name: string;
  uid: string;
  gameName: string;
}

export interface Registration {
  id?: string;
  teamId: string;
  teamName: string;
  captain: Player;
  players: Player[];
  substitute?: { name?: string; uid?: string; gameName?: string };
  phone: string;
  whatsapp: string;
  status: "pending" | "approved" | "rejected";
  upiTransactionId: string;
  paymentScreenshotUrl: string;
  createdAt?: any;
}

export class RegistrationRepository extends BaseRepository<Registration> {
  constructor() {
    super("registrations");
  }

  async registerTeam(data: Omit<Registration, "id">): Promise<string> {
    const db = this.db;
    const teamId = data.teamId;

    // Collect constraints keys
    const constraints: string[] = [
      `teamName:${data.teamName.toLowerCase().trim()}`,
      `transactionId:${data.upiTransactionId.toLowerCase().trim()}`,
      `uid:${data.captain.uid.trim()}`,
    ];

    data.players.forEach((p) => {
      constraints.push(`uid:${p.uid.trim()}`);
    });

    if (data.substitute?.uid) {
      constraints.push(`uid:${data.substitute.uid.trim()}`);
    }

    const regRef = db.collection("registrations").doc();

    await db.runTransaction(async (transaction) => {
      // 1. Read all constraint docs
      const constraintRefs = constraints.map((c) => db.collection("unique_constraints").doc(c));
      const snapshots = await Promise.all(constraintRefs.map((ref) => transaction.get(ref)));

      // 2. Check if any duplicate exists
      snapshots.forEach((snap) => {
        if (snap.exists) {
          const id = snap.id;
          if (id.startsWith("teamName:")) {
            throw new AppError("Team name is already registered", 400);
          } else if (id.startsWith("transactionId:")) {
            throw new AppError("Payment transaction ID has already been used", 400);
          } else if (id.startsWith("uid:")) {
            throw new AppError(`Player UID ${id.split("uid:")[1]} is already registered in another squad`, 400);
          }
        }
      });

      // 3. Increment registration count safely
      const countRef = db.collection("settings").doc("registrationCount");
      const countSnap = await transaction.get(countRef);
      const currentCount = countSnap.data()?.count || 0;

      const settingsRef = db.collection("settings").doc("tournament");
      const settingsSnap = await transaction.get(settingsRef);
      const settingsData = settingsSnap.data();

      if (settingsData?.registrationEnabled === false) {
        throw new AppError("Registrations are currently closed", 400);
      }

      if (currentCount >= (settingsData?.registrationLimit || 24)) {
        throw new AppError("All tournament slots are filled", 400);
      }

      // 4. Commit constraint locks
      constraintRefs.forEach((ref) => {
        transaction.set(ref, {
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
          teamId,
        });
      });

      // 5. Commit registration document
      transaction.set(regRef, {
        ...data,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      // 6. Update counts
      transaction.set(countRef, { count: currentCount + 1 }, { merge: true });
    });

    return regRef.id;
  }

  async releaseConstraints(data: Registration): Promise<void> {
    const db = this.db;
    const constraints: string[] = [
      `teamName:${data.teamName.toLowerCase().trim()}`,
      `transactionId:${data.upiTransactionId.toLowerCase().trim()}`,
      `uid:${data.captain.uid.trim()}`,
    ];

    data.players.forEach((p) => {
      constraints.push(`uid:${p.uid.trim()}`);
    });

    if (data.substitute?.uid) {
      constraints.push(`uid:${data.substitute.uid.trim()}`);
    }

    const batch = db.batch();
    constraints.forEach((c) => {
      batch.delete(db.collection("unique_constraints").doc(c));
    });
    await batch.commit();
  }
}
export default RegistrationRepository;
