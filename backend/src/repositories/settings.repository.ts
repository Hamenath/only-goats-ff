import { BaseRepository } from "./base.repository";

export interface Settings {
  id?: string;
  tournamentDate: string;
  registrationLimit: number;
  registrationEnabled: boolean;
  prizePool?: number;
  entryFee?: number;
  reEntry?: number;
}

export class SettingsRepository extends BaseRepository<Settings> {
  constructor() {
    super("settings");
  }

  async getTournamentSettings(): Promise<Settings | null> {
    return this.getById("tournament");
  }

  async updateTournamentSettings(data: Partial<Settings>): Promise<void> {
    await this.update("tournament", data);
  }
}
export default SettingsRepository;
