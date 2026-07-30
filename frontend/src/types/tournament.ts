export interface Tournament {
  id: string;
  title: string;
  season: string;
  status: "draft" | "upcoming" | "live" | "completed" | "archived";
  isFeatured?: boolean;
  isActive?: boolean;
  bannerUrl?: string;
  posterUrl?: string;
  description?: string;
  maxTeams: number;
  qualifierCount: number;
  teamsPerQualifier: number;
  teamsQualifiedPerQualifier: number;
  premiumPassEnabled: boolean;
  premiumPassSlots: number;
  premiumPassFee: number;
  entryFee: number;
  prizePool: string;
  rules?: string;
  startDate?: string;
  endDate?: string;
  regCloseTime?: string;
  createdAt?: unknown;
  updatedAt?: unknown;
}

export interface MatchItem {
  id: string;
  tournamentId: string;
  name: string;
  map: string;
  round: string;
  matchTime: string;
  matchStartTime?: string;
  roomRevealTime?: string;
  regCloseTime?: string;
  maxSquads: number;
  status: "upcoming" | "live" | "completed" | "cancelled";
  isPublished: boolean;
  isArchived?: boolean;
  bannerUrl?: string;
  roomId?: string;
  roomPassword?: string;
  streamUrl?: string;
  whatsappUrl?: string;
  rules?: string;
  description?: string;
  orderIndex?: number;
  createdAt?: unknown;
  updatedAt?: unknown;
}

export interface RegistrationData {
  id: string;
  tournamentId: string;
  teamId: string;
  teamName: string;
  captain: { name: string; uid: string; gameName?: string };
  players: { name: string; uid: string; gameName?: string }[];
  substitute?: { name: string; uid: string; gameName?: string };
  phone: string;
  whatsapp: string;
  upiTransactionId: string;
  paymentScreenshotUrl: string;
  status: "pending" | "approved" | "rejected";
  allocatedStage: string;
  qualificationStatus: "pending" | "qualified_round_2" | "eliminated" | "premium_pass_granted";
  registrationOrder: number;
  createdAt?: unknown;
}

export interface AuditLogEntry {
  id: string;
  tournamentId?: string;
  adminName: string;
  action: string;
  details: string;
  createdAt?: unknown;
}
