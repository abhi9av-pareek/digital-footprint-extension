import {
  getStorageData,
  setStorageData,
} from "./storage";

import type {
  DigitalFootprintStorage,
} from "../shared/types";

const EMPTY_STORAGE: DigitalFootprintStorage = {
  visits: [],
  daily: {},
};

export async function clearAllHistory(): Promise<void> {
  // Clear recorded browsing data.
  await setStorageData(EMPTY_STORAGE);

  // Remove any active tracking sessions.
  await chrome.storage.local.remove([
    "activeSessions",
    "activeTabId",
  ]);


}

export async function getStorageSummary(): Promise<{
  totalVisits: number;
  totalDays: number;
}> {
  const storage =
    await getStorageData(
      EMPTY_STORAGE
    );

  return {
    totalVisits:
      storage.visits.length,

    totalDays:
      Object.keys(
        storage.daily
      ).length,
  };
}
