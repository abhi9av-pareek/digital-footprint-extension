import type {
  DailyFootprint,
  DigitalFootprintStorage,
} from "../shared/types";
import type { WebsiteCategory } from "../category/types";

export interface StreakResult {
  currentStreak: number;
  longestStreak: number;
  activeToday: boolean;
}

function getLocalDateKey(timestamp: number): string {
  const date = new Date(timestamp);

  const year = date.getFullYear();
  const month = String(
    date.getMonth() + 1
  ).padStart(2, "0");
  const day = String(
    date.getDate()
  ).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function parseDateKey(dateKey: string): Date {
  const [year, month, day] =
    dateKey.split("-").map(Number);

  return new Date(year, month - 1, day);
}

function differenceInDays(
  first: Date,
  second: Date
): number {
  const millisecondsPerDay =
    24 * 60 * 60 * 1000;

  return Math.round(
    (first.getTime() - second.getTime()) /
      millisecondsPerDay
  );
}

function hasActivity(
  daily: DailyFootprint | undefined
): boolean {
  return !!daily &&
    Object.keys(daily.websites).length > 0;
}

function calculateStreakFromDates(
  activeDates: string[]
): StreakResult {
  if (activeDates.length === 0) {
    return {
      currentStreak: 0,
      longestStreak: 0,
      activeToday: false,
    };
  }

  const sortedDates = [...new Set(activeDates)]
    .sort();

  const today =
    getLocalDateKey(Date.now());

  const latestDate =
    sortedDates[sortedDates.length - 1];

  const daysSinceLatest =
    differenceInDays(
      parseDateKey(today),
      parseDateKey(latestDate)
    );

  const activeToday =
    latestDate === today;

  let currentStreak = 0;

  if (daysSinceLatest <= 1) {
    currentStreak = 1;

    for (
      let index = sortedDates.length - 1;
      index > 0;
      index--
    ) {
      const current =
        parseDateKey(
          sortedDates[index]
        );

      const previous =
        parseDateKey(
          sortedDates[index - 1]
        );

      if (
        differenceInDays(
          current,
          previous
        ) === 1
      ) {
        currentStreak += 1;
      } else {
        break;
      }
    }
  }

  let longestStreak = 1;
  let runningStreak = 1;

  for (
    let index = 1;
    index < sortedDates.length;
    index++
  ) {
    const current =
      parseDateKey(
        sortedDates[index]
      );

    const previous =
      parseDateKey(
        sortedDates[index - 1]
      );

    if (
      differenceInDays(
        current,
        previous
      ) === 1
    ) {
      runningStreak += 1;
    } else {
      runningStreak = 1;
    }

    longestStreak = Math.max(
      longestStreak,
      runningStreak
    );
  }

  return {
    currentStreak,
    longestStreak,
    activeToday,
  };
}

export function calculateOverallStreak(
  storage: DigitalFootprintStorage
): StreakResult {
  const activeDates = Object.values(
    storage.daily
  )
    .filter(hasActivity)
    .map((daily) => daily.date);

  return calculateStreakFromDates(
    activeDates
  );
}

export function calculateWebsiteStreak(
  storage: DigitalFootprintStorage,
  domain: string
): StreakResult {
  const activeDates = Object.values(
    storage.daily
  )
    .filter(
      (daily) =>
        daily.websites[domain] !== undefined
    )
    .map((daily) => daily.date);

  return calculateStreakFromDates(
    activeDates
  );
}

export function calculateCategoryStreak(
  storage: DigitalFootprintStorage,
  category: WebsiteCategory
): StreakResult {
  const activeDates = Object.values(
    storage.daily
  )
    .filter(
      (daily) =>
        daily.categories[category] !==
        undefined
    )
    .map((daily) => daily.date);

  return calculateStreakFromDates(
    activeDates
  );
}
