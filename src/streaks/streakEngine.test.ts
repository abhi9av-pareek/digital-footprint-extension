import {
  calculateOverallStreak,
} from "./streakEngine";

function createStorage(
  dates: string[]
) {
  return {
    visits: [],
    daily: Object.fromEntries(
      dates.map((date) => [
        date,
        {
          date,
          websites: {
            "github.com": {
              visits: 1,
              duration: 1000,
            },
          },
          categories: {
            technology: {
              visits: 1,
              duration: 1000,
            },
          },
        },
      ])
    ),
  };
}

const result =
  calculateOverallStreak(
    createStorage([
      "2026-09-01",
      "2026-09-02",
      "2026-09-03",
      "2026-09-05",
      "2026-09-06",
    ])
  );

console.log(
  "Current streak:",
  result.currentStreak
);

console.log(
  "Longest streak:",
  result.longestStreak
);

console.log(
  "Active today:",
  result.activeToday
);
