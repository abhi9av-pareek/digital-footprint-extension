import type { WebsiteCategory } from "../category/types";

export interface DashboardWebsite {
  domain: string;
  name: string;
  visits: number;
  duration: number;
}

export interface DashboardCategory {
  category: WebsiteCategory;
  visits: number;
  duration: number;
}

export interface DashboardData {
  currentStreak: number;
  longestStreak: number;
  activeToday: boolean;
  totalVisitsToday: number;
  totalDurationToday: number;
  websites: DashboardWebsite[];
  categories: DashboardCategory[];
}
