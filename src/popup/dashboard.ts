import {
  getStorageData,
} from "../storage/storage";

import {
  calculateOverallStreak,
} from "../streaks/streakEngine";

import type {
  DigitalFootprintStorage,
} from "../shared/types";

import type {
  DashboardData,
} from "./types";

const EMPTY_STORAGE: DigitalFootprintStorage = {
  visits: [],
  daily: {},
};

function getTodayKey(): string {
  const date = new Date();

  const year = date.getFullYear();
  const month = String(
    date.getMonth() + 1
  ).padStart(2, "0");
  const day = String(
    date.getDate()
  ).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export async function getDashboardData(): Promise<DashboardData> {
  const storage =
    await getStorageData(
      EMPTY_STORAGE
    );

  const todayKey =
    getTodayKey();

  const today =
    storage.daily[todayKey];

  const streak =
    calculateOverallStreak(
      storage
    );

  const websites =
    today
      ? Object.entries(
          today.websites
        )
          .map(
            ([domain, stats]) => {
              const visit =
                storage.visits.find(
                  (item) =>
                    item.domain ===
                    domain
                );

              return {
                domain,
                name:
                  visit?.websiteName ??
                  domain,
                visits:
                  stats.visits,
                duration:
                  stats.duration,
              };
            }
          )
          .sort(
            (a, b) =>
              b.visits -
              a.visits
          )
      : [];

  const categories =
    today
      ? Object.entries(
          today.categories
        )
          .map(
            ([category, stats]) => ({
              category:
                category as DashboardData["categories"][number]["category"],
              visits:
                stats.visits,
              duration:
                stats.duration,
            })
          )
          .sort(
            (a, b) =>
              b.visits -
              a.visits
          )
      : [];

  const totalVisitsToday =
    websites.reduce(
      (total, website) =>
        total + website.visits,
      0
    );

  const totalDurationToday =
    websites.reduce(
      (total, website) =>
        total + website.duration,
      0
    );

  return {
    currentStreak:
      streak.currentStreak,

    longestStreak:
      streak.longestStreak,

    activeToday:
      streak.activeToday,

    totalVisitsToday,

    totalDurationToday,

    websites,

    categories,
  };
}
