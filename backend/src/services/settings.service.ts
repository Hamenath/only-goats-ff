import { SettingsRepository, Settings } from "../repositories/settings.repository";
import { AuditLogRepository } from "../repositories/auditLog.repository";

export class SettingsService {
  private settingsRepository: SettingsRepository;
  private auditLogRepository: AuditLogRepository;

  constructor() {
    this.settingsRepository = new SettingsRepository();
    this.auditLogRepository = new AuditLogRepository();
  }

  async getSettings(): Promise<Settings | null> {
    return this.settingsRepository.getTournamentSettings();
  }

  async updateSettings(data: Partial<Settings>, adminId: string, adminEmail: string): Promise<void> {
    await this.settingsRepository.updateTournamentSettings(data);
    await this.auditLogRepository.log(
      adminId,
      adminEmail,
      "SETTINGS_UPDATED",
      `Tournament settings updated: ${JSON.stringify(data)}`
    );
  }
}
export default SettingsService;
