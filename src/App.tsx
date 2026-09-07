import { useEffect, useState } from "react";
import History from "./components/History";
import Settings from "./components/Settings";
import {
  getDashboardData,
} from "./popup/dashboard";
import type {
  DashboardData,
} from "./popup/types";

function formatDuration(
  milliseconds: number
): string {
  const seconds =
    Math.floor(milliseconds / 1000);

  if (seconds < 60) {
    return `${seconds}s`;
  }

  const minutes =
    Math.floor(seconds / 60);

  if (minutes < 60) {
    return `${minutes}m`;
  }

  const hours =
    Math.floor(minutes / 60);

  return `${hours}h ${minutes % 60}m`;
}

function getCategoryIcon(
  category: string
): string {
  const icons: Record<
    string,
    string
  > = {
    technology: "💻",
    education: "📚",
    sports: "🏏",
    news: "📰",
    social: "💬",
    entertainment: "🎬",
    business: "💼",
    shopping: "🛒",
    finance: "💰",
    gaming: "🎮",
    health: "❤️",
    travel: "✈️",
    other: "🌐",
  };

  return icons[category] ?? "🌐";
}

function formatCategoryName(
  category: string
): string {
  return (
    category.charAt(0).toUpperCase() +
    category.slice(1)
  );
}

function App() {
  const [data, setData] =
    useState<DashboardData | null>(
      null
    );

  const [loading, setLoading] =
    useState(true);

  const [showHistory, setShowHistory] =
    useState(false);

  const [showSettings, setShowSettings] =
    useState(false);

  useEffect(() => {
    getDashboardData()
      .then(setData)
      .finally(() =>
        setLoading(false)
      );
  }, []);

  if (loading) {
    return (
      <div className="app">
        <p>Loading...</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="app">
        <p>
          Unable to load activity.
        </p>
      </div>
    );
  }

  if (showHistory) {
    return (
      <History
        onBack={() =>
          setShowHistory(false)
        }
      />
    );
  }

  if (showSettings) {
    return (
      <Settings
        onBack={() =>
          setShowSettings(false)
        }
      />
    );
  }

  return (
    <div className="app">
      {/* Header */}
      <header className="header">
        <div>
          <h1>
            Digital Footprint
          </h1>

          <p>
            Your browsing activity
          </p>
        </div>

        <button
          className="settings-button"
          onClick={() =>
            setShowSettings(true)
          }
          aria-label="Open settings"
        >
          ⚙️
        </button>
      </header>

      {/* Streak */}
      <section className="streak-card">
        <div className="streak-icon">
          🔥
        </div>

        <div>
          <div className="streak-number">
            {data.currentStreak}
          </div>

          <div className="streak-label">
            {data.activeToday
              ? "You're active today"
              : "Keep your streak alive"}
          </div>
        </div>
      </section>

      {/* Today's Summary */}
      <section className="summary">
        <div className="summary-item">
          <strong>
            {data.totalVisitsToday}
          </strong>

          <span>
            Visits Today
          </span>
        </div>

        <div className="summary-item">
          <strong>
            {formatDuration(
              data.totalDurationToday
            )}
          </strong>

          <span>
            Browsing Time
          </span>
        </div>
      </section>

      {/* Categories */}
      <section className="section">
        <div className="section-header">
          <h2>
            Categories
          </h2>
        </div>

        {data.categories.length === 0 ? (
          <p className="empty">
            No activity yet today.
          </p>
        ) : (
          data.categories
            .slice(0, 5)
            .map((item) => (
              <div
                className="activity-row"
                key={item.category}
              >
                <span className="activity-name">
                  {getCategoryIcon(
                    item.category
                  )}{" "}
                  {formatCategoryName(
                    item.category
                  )}
                </span>

                <span className="activity-value">
                  {item.visits}{" "}
                  {item.visits === 1
                    ? "visit"
                    : "visits"}
                </span>
              </div>
            ))
        )}
      </section>

      {/* Top Websites */}
      <section className="section">
        <div className="section-header">
          <h2>
            Top Websites
          </h2>
        </div>

        {data.websites.length === 0 ? (
          <p className="empty">
            No websites visited yet.
          </p>
        ) : (
          data.websites
            .slice(0, 5)
            .map((website) => (
              <div
                className="activity-row"
                key={website.domain}
              >
                <span className="activity-name">
                  {website.name}
                </span>

                <span className="activity-value">
                  {website.visits}{" "}
                  {website.visits === 1
                    ? "visit"
                    : "visits"}
                </span>
              </div>
            ))
        )}
      </section>

      {/* Footer */}
      <footer className="footer">
        <div>
          <span>
            Longest Streak
          </span>

          <strong>
            {data.longestStreak}{" "}
            {data.longestStreak === 1
              ? "day"
              : "days"}
          </strong>
        </div>

        <button
          className="history-button"
          onClick={() =>
            setShowHistory(true)
          }
        >
          View History →
        </button>
      </footer>
    </div>
  );
}

export default App;
