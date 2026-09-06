const STORAGE_KEY = "digitalFootprint";

export async function getStorageData<T>(
  defaultValue: T
): Promise<T> {
  const result = await chrome.storage.local.get(STORAGE_KEY);

  return (result[STORAGE_KEY] as T | undefined) ?? defaultValue;
}

export async function setStorageData<T>(
  data: T
): Promise<void> {
  await chrome.storage.local.set({
    [STORAGE_KEY]: data,
  });
}
