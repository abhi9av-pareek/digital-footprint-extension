import { useEffect, useState } from "react";
import {
  clearAllHistory,
  getStorageSummary,
} from "../storage/dataManager";
import {
  isTrackingEnabled,
  setTrackingEnabled,
} from "../storage/trackingState";

interface SettingsProps {
  onBack: () => void;
}

function Settings({
  onBack,
}: SettingsProps) {
  const [summary, setSummary] =
    useState({
      totalVisits: 0,
      totalDays: 0,
    });

  const [trackingEnabled, setTrackingEnabledState] =
    useState(true);

  const [clearing, setClearing] =
    useState(false);

  useEffect(() => {
    Promise.all([
      getStorageSummary(),
      isTrackingEnabled(),
    ]).then(
      ([storageSummary, enabled]) => {
        setSummary(storageSummary);
        setTrackingEnabledState(enabled);
      }
    );
  }, []);

  async function handleTrackingToggle() {
    const newValue =
      !trackingEnabled;

    await setTrackingEnabled(
      newValue
    );

    setTrackingEnabledState(
      newValue
    );
  }

  async function handleClearHistory() {
    const confirmed =
      window.confirm(
        "Are you sure you want to delete all browsing history? This cannot be undone."
      );

    if (!confirmed) {
      return;
    }

    setClearing(true);

    try {
      await clearAllHistory();

      setSummary({
        totalVisits: 0,
        totalDays: 0,
      });
    } finally {
      setClearing(false);
    }
  }

  return (
    <div className="settings">
      <div className="history-header">
        <button
          className="back-button"
          onClick={onBack}
        >
          ←
        </button>

        <div>
          <h1>Settings</h1>

          <p>
            Privacy & data controls
          </p>
        </div>
      </div>

      <section className="settings-card">
        <h2>Tracking</h2>

        <div className="tracking-row">
          <div>
            <strong>
              Website tracking
            </strong>

            <p className="settings-description">
              Automatically record your
              website visits.
            </p>
          </div>

          <button
            className={`toggle ${
              trackingEnabled
                ? "toggle-on"
                : "toggle-off"
            }`}
            onClick={
              handleTrackingToggle
            }
            aria-label={
              trackingEnabled
                ? "Pause tracking"
                : "Resume tracking"
            }
          >
            <span />
          </button>
        </div>

        <div
          className={`tracking-status ${
            trackingEnabled
              ? "status-active"
              : "status-paused"
          }`}
        >
          {trackingEnabled
            ? "● Tracking active"
            : "● Tracking paused"}
        </div>
      </section>

      <section className="settings-card">
        <h2>Privacy</h2>

        <p className="settings-description">
          Your browsing activity is stored
          locally on this device. It is not
          uploaded to a server.
        </p>

        <div className="storage-stats">
          <div>
            <strong>
              {summary.totalVisits}
            </strong>

            <span>
              Visits stored
            </span>
          </div>

          <div>
            <strong>
              {summary.totalDays}
            </strong>

            <span>
              Days tracked
            </span>
          </div>
        </div>
      </section>

      <section className="settings-card danger-card">
        <h2>Delete data</h2>

        <p className="settings-description">
          Permanently delete all recorded
          browsing activity from this
          extension.
        </p>

        <button
          className="clear-button"
          onClick={handleClearHistory}
          disabled={clearing}
        >
          {clearing
            ? "Clearing..."
            : "Clear All History"}
        </button>
      </section>
    </div>
  );
}

export default Settings;
