import {
  getStorageData,
} from "../storage/storage";

import type {
  DigitalFootprintStorage,
  StoredVisit,
} from "../shared/types";

const EMPTY_STORAGE: DigitalFootprintStorage = {
  visits: [],
  daily: {},
};

export async function getVisitHistory(
  limit = 100
): Promise<StoredVisit[]> {
  const storage =
    await getStorageData(
      EMPTY_STORAGE
    );

  return [...storage.visits]
    .sort(
      (a, b) =>
        b.startedAt - a.startedAt
    )
    .slice(0, limit);
}
