import { RegistrationRepository, Registration } from "../repositories/registration.repository";
import { AuditLogRepository } from "../repositories/auditLog.repository";
import { AppError } from "../middlewares/errorHandler";

export class RegistrationService {
  private regRepository: RegistrationRepository;
  private auditLogRepository: AuditLogRepository;

  constructor() {
    this.regRepository = new RegistrationRepository();
    this.auditLogRepository = new AuditLogRepository();
  }

  async apply(data: Omit<Registration, "id">): Promise<string> {
    return this.regRepository.registerTeam(data);
  }

  async listRegistrations(status?: string, limit = 50) {
    const db = this.regRepository.getById; // Check DB connection accessor
    let query = this.regRepository["collection"].orderBy("createdAt", "desc").limit(limit);
    if (status) {
      query = this.regRepository["collection"].where("status", "==", status).orderBy("createdAt", "desc").limit(limit);
    }
    const snap = await query.get();
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  }

  async updateStatus(
    id: string,
    status: "approved" | "rejected" | "pending",
    adminId: string,
    adminEmail: string
  ): Promise<void> {
    const reg = await this.regRepository.getById(id);
    if (!reg) throw new AppError("Registration record not found", 404);

    await this.regRepository.update(id, { status });

    // Release constraint locks if registration is rejected
    if (status === "rejected") {
      await this.regRepository.releaseConstraints(reg);
    }

    await this.auditLogRepository.log(
      adminId,
      adminEmail,
      `REGISTRATION_${status.toUpperCase()}`,
      `Registration ID ${id} for team '${reg.teamName}' was marked as ${status}`,
      id
    );
  }

  async removeRegistration(id: string, adminId: string, adminEmail: string): Promise<void> {
    const reg = await this.regRepository.getById(id);
    if (!reg) throw new AppError("Registration record not found", 404);

    await this.regRepository.delete(id);
    await this.regRepository.releaseConstraints(reg);

    // Decrement slots count
    const countRef = this.regRepository["db"].collection("settings").doc("registrationCount");
    const countSnap = await countRef.get();
    const currentCount = countSnap.data()?.count || 0;
    if (currentCount > 0) {
      await countRef.set({ count: currentCount - 1 }, { merge: true });
    }

    await this.auditLogRepository.log(
      adminId,
      adminEmail,
      "REGISTRATION_DELETED",
      `Registration ID ${id} for team '${reg.teamName}' was deleted from database`,
      id
    );
  }
}
export default RegistrationService;
