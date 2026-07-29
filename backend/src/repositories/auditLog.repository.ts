import { BaseRepository } from "./base.repository";
import { admin } from "../firebase/admin";

export interface AuditLog {
  id?: string;
  adminId: string;
  adminEmail: string;
  action: string;
  targetId?: string;
  details: string;
  timestamp?: any;
  ipAddress?: string;
}

export class AuditLogRepository extends BaseRepository<AuditLog> {
  constructor() {
    super("audit_logs");
  }

  async log(adminId: string, adminEmail: string, action: string, details: string, targetId?: string, ipAddress?: string): Promise<string> {
    return this.create({
      adminId,
      adminEmail,
      action,
      details,
      targetId,
      ipAddress,
      timestamp: admin.firestore.FieldValue.serverTimestamp()
    });
  }

  async getRecentLogs(limit = 100): Promise<AuditLog[]> {
    const snap = await this.collection.orderBy("createdAt", "desc").limit(limit).get();
    return snap.docs.map((doc) => ({ id: doc.id, ...doc.data() } as AuditLog));
  }
}
export default AuditLogRepository;
