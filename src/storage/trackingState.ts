const TRACKING_STATE_KEY =
  "trackingEnabled";

export async function isTrackingEnabled(): Promise<boolean> {
  const result =
    await chrome.storage.local.get(
      TRACKING_STATE_KEY
    );

  // Tracking is enabled by default.
  return result[TRACKING_STATE_KEY] !== false;
}

export async function setTrackingEnabled(
  enabled: boolean
): Promise<void> {
  await chrome.storage.local.set({
    [TRACKING_STATE_KEY]: enabled,
  });

  console.log(
    enabled
      ? "▶️ Tracking enabled"
      : "⏸️ Tracking disabled"
  );
}
