export interface UserProfile {
  id: string;
  username: string;
  avatar_skin: "samurai" | "kawaii" | "shinobi";
  level: number;
  xp: number;
  xp_to_next_level: number;
  streak: number;
  longest_streak: number;
  last_activity_date: string | null;
  total_reviews: number;
  correct_reviews: number;
  xp_this_week: number;
  week_start: string;
  created_at: string;
  updated_at: string;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  condition_type: "streak" | "level" | "reviews" | "correct" | "perfect_session";
  condition_value: number;
}

export interface UserBadge {
  id: string;
  badge_id: string;
  earned_at: string;
  badge: Badge;
}

export interface VocabReview {
  id: string;
  user_id: string;
  vocab_id: number;
  srs_level: number; // 0=new 1-2=apprenti 3-4=guru 5-6=maître 7-8=éclairé 9=accompli
  next_review_at: string;
  last_reviewed_at: string | null;
  correct_count: number;
  incorrect_count: number;
  created_at: string;
}

export type SrsStage = "new" | "apprenti" | "guru" | "maitre" | "eclaire" | "accompli";

export function srsStage(level: number): SrsStage {
  if (level === 0) return "new";
  if (level <= 2) return "apprenti";
  if (level <= 4) return "guru";
  if (level <= 6) return "maitre";
  if (level <= 8) return "eclaire";
  return "accompli";
}

export interface DailyQuest {
  id: string;
  user_id: string;
  quest_date: string;
  quest_type: "review" | "learn_new" | "games" | "streak";
  target: number;
  current_progress: number;
  xp_reward: number;
  completed: boolean;
  completed_at: string | null;
  created_at: string;
}

export interface LeaderboardEntry {
  username: string;
  avatar_skin: string;
  level: number;
  xp_this_week: number;
}

export interface AddXpResult {
  new_xp: number;
  new_level: number;
  leveled_up: boolean;
  xp_added: number;
}

export const AVATAR_EMOJI: Record<string, string> = {
  samurai: "⚔️",
  kawaii: "🌸",
  shinobi: "🥷",
};

export const LEVEL_TITLES: Record<number, string> = {
  1: "Novice", 5: "Apprenti", 10: "Ronin", 15: "Samouraï",
  20: "Kensei", 25: "Maître du Dojo", 30: "Seigneur de Guerre",
  35: "Légendaire", 40: "Immortel", 45: "Dieu de la Guerre", 50: "Shogun",
};

export function getLevelTitle(level: number): string {
  const thresholds = Object.keys(LEVEL_TITLES).map(Number).sort((a, b) => b - a);
  for (const t of thresholds) {
    if (level >= t) return LEVEL_TITLES[t];
  }
  return "Novice";
}
