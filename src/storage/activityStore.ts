import type {
  DailyFootprint,
  DigitalFootprintStorage,
  VisitSession,
} from "../shared/types";
import {
  getStorageData,
  setStorageData,
} from "./storage";

const EMPTY_STORAGE: DigitalFootprintStorage = {
  visits: [],
  daily: {},
};

function getDateKey(timestamp: number): string {
  const date = new Date(timestamp);

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function createEmptyDailyFootprint(
  date: string
): DailyFootprint {
  return {
    date,
    websites: {},
    categories: {},
  };
}

export async function saveVisit(
  session: VisitSession
): Promise<void> {
  if (session.endedAt === null) {
    throw new Error(
      "Cannot save an active session."
    );
  }

  const storage = await getStorageData(
    EMPTY_STORAGE
  );

  const duration =
    session.endedAt - session.startedAt;

  const visit = {
    id: session.id,
    domain: session.domain,
    websiteName: session.websiteName,
    category: session.category,
    startedAt: session.startedAt,
    endedAt: session.endedAt,
    duration,
  };

  storage.visits.push(visit);

  const date = getDateKey(session.startedAt);

  if (!storage.daily[date]) {
    storage.daily[date] =
      createEmptyDailyFootprint(date);
  }

  const daily = storage.daily[date];

  // Website statistics
  if (!daily.websites[session.domain]) {
    daily.websites[session.domain] = {
      visits: 0,
      duration: 0,
    };
  }

  daily.websites[session.domain].visits += 1;
  daily.websites[session.domain].duration += duration;

  // Category statistics
  // Category statistics
  const categoryStats = daily.categories[session.category];

  if (categoryStats) {
    categoryStats.visits += 1;
    categoryStats.duration += duration;
  } else {
    daily.categories[session.category] = {
      visits: 1,
      duration,
    };
  }
  await setStorageData(storage);


}
