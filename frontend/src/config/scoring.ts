export interface PlacementRule {
  place: string;
  points: number;
  minRank: number;
  maxRank: number;
  highlight?: boolean;
}

export const PLACEMENT_RULES: PlacementRule[] = [
  { place: "1st (Booyah!)", points: 12, minRank: 1, maxRank: 1, highlight: true },
  { place: "2nd Place", points: 9, minRank: 2, maxRank: 2, highlight: false },
  { place: "3rd Place", points: 8, minRank: 3, maxRank: 3, highlight: false },
  { place: "4th Place", points: 7, minRank: 4, maxRank: 4, highlight: false },
  { place: "5th Place", points: 6, minRank: 5, maxRank: 5, highlight: false },
  { place: "6th Place", points: 5, minRank: 6, maxRank: 6, highlight: false },
  { place: "7th Place", points: 4, minRank: 7, maxRank: 7, highlight: false },
  { place: "8th Place", points: 3, minRank: 8, maxRank: 8, highlight: false },
  { place: "9th–12th Place", points: 2, minRank: 9, maxRank: 12, highlight: false },
  { place: "13th+ Place", points: 0, minRank: 13, maxRank: 999, highlight: false },
];

export const KILL_POINT_VALUE = 1;

export const PLACEMENT_POINTS_MAP: Record<number, number> = {
  1: 12,
  2: 9,
  3: 8,
  4: 7,
  5: 6,
  6: 5,
  7: 4,
  8: 3,
  9: 2,
  10: 2,
  11: 2,
  12: 2,
};

export function getPlacementPoints(rank: number): number {
  if (rank <= 0) return 0;
  if (rank in PLACEMENT_POINTS_MAP) {
    return PLACEMENT_POINTS_MAP[rank];
  }
  return 0; // 13th+ place = 0 PTS
}

export function calculateTotalPoints(placementRank: number, kills: number): number {
  const placementPts = getPlacementPoints(placementRank);
  const killPts = Math.max(0, kills) * KILL_POINT_VALUE;
  return placementPts + killPts;
}

export const SCORING_EXAMPLES = [
  { team: "Team A", placement: "1st", placementPts: 12, kills: 6, total: 18, highlight: true },
  { team: "Team B", placement: "2nd", placementPts: 9, kills: 8, total: 17, highlight: false },
  { team: "Team C", placement: "5th", placementPts: 6, kills: 10, total: 16, highlight: false },
];
