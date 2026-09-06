import type { WebsiteCategory } from "../category/types";

export interface VisitSession {
  id: string;
  domain: string;
  websiteName: string;
  category: WebsiteCategory;
  startedAt: number;
  endedAt: number | null;
}

export interface StoredVisit {
  id: string;
  domain: string;
  websiteName: string;
  category: WebsiteCategory;
  startedAt: number;
  endedAt: number;
  duration: number;
}

export interface DailyFootprint {
  date: string;

  websites: Record<
    string,
    {
      visits: number;
      duration: number;
    }
  >;

  categories: Partial<
    Record<
      WebsiteCategory,
      {
        visits: number;
        duration: number;
      }
    >
  >;
}

export interface DigitalFootprintStorage {
  visits: StoredVisit[];
  daily: Record<string, DailyFootprint>;
}
