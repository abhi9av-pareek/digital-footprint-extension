import { useEffect, useMemo, useState } from "react";
import {
  getVisitHistory,
} from "../history/history";
import type {
  StoredVisit,
} from "../shared/types";
import type {
  WebsiteCategory,
} from "../category/types";

interface HistoryProps {
  onBack: () => void;
}

interface CategoryGroup {
  category: WebsiteCategory;
  visits: StoredVisit[];
  totalDuration: number;
}

const CATEGORY_ORDER: WebsiteCategory[] = [
  "education",
  "technology",
  "sports",
  "news",
  "social",
  "entertainment",
  "business",
  "shopping",
  "finance",
  "gaming",
  "health",
  "travel",
  "other",
];

const CATEGORY_INFO: Record<
  WebsiteCategory,
  {
    icon: string;
    label: string;
    description: string;
  }
> = {
  education: {
    icon: "📚",
    label: "Education",
    description: "Learning and educational websites",
  },

  technology: {
    icon: "💻",
    label: "Technology",
    description: "Development, tools and technology",
  },

  sports: {
    icon: "🏏",
    label: "Sports",
    description: "Sports, scores and competitions",
  },

  news: {
    icon: "📰",
    label: "News",
    description: "News and current information",
  },

  social: {
    icon: "💬",
    label: "Social",
    description: "Social media and communication",
  },

  entertainment: {
    icon: "🎬",
    label: "Entertainment",
    description: "Videos, movies, music and more",
  },

  business: {
    icon: "💼",
    label: "Business",
    description: "Business and professional websites",
  },

  shopping: {
    icon: "🛒",
    label: "Shopping",
    description: "Shopping and e-commerce websites",
  },

  finance: {
    icon: "💰",
    label: "Finance",
    description: "Banking, investing and finance",
  },

  gaming: {
    icon: "🎮",
    label: "Gaming",
    description: "Games and gaming platforms",
  },

  health: {
    icon: "❤️",
    label: "Health",
    description: "Health and wellness websites",
  },

  travel: {
    icon: "✈️",
    label: "Travel",
    description: "Travel and transportation websites",
  },

  other: {
    icon: "🌐",
    label: "Other",
    description: "Uncategorized websites",
  },
};

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

function formatTime(
  timestamp: number
): string {
  return new Date(
    timestamp
  ).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function History({
  onBack,
}: HistoryProps) {
  const [visits, setVisits] =
    useState<StoredVisit[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [expandedCategories, setExpandedCategories] =
    useState<Record<string, boolean>>({});

  useEffect(() => {
    getVisitHistory()
      .then(setVisits)
      .finally(() =>
        setLoading(false)
      );
  }, []);

  const categoryGroups =
    useMemo<CategoryGroup[]>(() => {
      const groups =
        new Map<
          WebsiteCategory,
          StoredVisit[]
        >();

      for (const visit of visits) {
        const existing =
          groups.get(
            visit.category
          );

        if (existing) {
          existing.push(visit);
        } else {
          groups.set(
            visit.category,
            [visit]
          );
        }
      }

      return CATEGORY_ORDER
        .filter((category) =>
          groups.has(category)
        )
        .map((category) => {
          const categoryVisits =
            groups.get(category) ?? [];

          return {
            category,
            visits: categoryVisits,
            totalDuration:
              categoryVisits.reduce(
                (total, visit) =>
                  total + visit.duration,
                0
              ),
          };
        });
    }, [visits]);

  function toggleCategory(
    category: WebsiteCategory
  ) {
    setExpandedCategories(
      (current) => ({
        ...current,
        [category]:
          !current[category],
      })
    );
  }

  return (
    <div className="history">
      {/* Header */}
      <div className="history-header">
        <button
          className="back-button"
          onClick={onBack}
          aria-label="Go back"
        >
          ←
        </button>

        <div>
          <h1>History</h1>

          <p>
            Your recent browsing activity
          </p>
        </div>
      </div>

      {loading ? (
        <p className="empty">
          Loading history...
        </p>
      ) : visits.length === 0 ? (
        <div className="history-empty">
          <div className="history-empty-icon">
            🌐
          </div>

          <strong>
            No browsing activity yet
          </strong>

          <span>
            Your website visits will
            appear here.
          </span>
        </div>
      ) : (
        <div className="history-groups">
          {categoryGroups.map(
            (group) => {
              const info =
                CATEGORY_INFO[
                  group.category
                ];

              const isExpanded =
                expandedCategories[
                  group.category
                ] === true;

              return (
                <section
                  className={`history-category ${group.category}`}
                  key={group.category}
                >
                  {/* Category Header */}
                  <button
                    className="history-category-header"
                    onClick={() =>
                      toggleCategory(
                        group.category
                      )
                    }
                    aria-expanded={
                      isExpanded
                    }
                  >
                    <div className="category-left">
                      <div className="category-icon">
                        {info.icon}
                      </div>

                      <div className="category-heading">
                        <strong>
                          {info.label}
                        </strong>

                        <span>
                          {info.description}
                        </span>
                      </div>
                    </div>

                    <div className="category-right">
                      <div className="category-summary">
                        <strong>
                          {
                            group.visits
                              .length
                          }{" "}
                          {group.visits
                            .length === 1
                            ? "visit"
                            : "visits"}
                        </strong>

                        <span>
                          {formatDuration(
                            group.totalDuration
                          )}
                        </span>
                      </div>

                      <span
                        className={`category-chevron ${
                          isExpanded
                            ? "expanded"
                            : ""
                        }`}
                      >
                        ⌄
                      </span>
                    </div>
                  </button>

                  {/* Visits */}
                  {isExpanded && (
                    <div className="history-category-list">
                      {group.visits.map(
                        (visit) => (
                          <div
                            className="history-item"
                            key={visit.id}
                          >
                            <div className="history-icon">
                              {info.icon}
                            </div>

                            <div className="history-content">
                              <strong>
                                {
                                  visit.websiteName
                                }
                              </strong>

                              <span>
                                {
                                  visit.domain
                                }
                              </span>

                              <small>
                                {formatTime(
                                  visit.startedAt
                                )}{" "}
                                ·{" "}
                                {formatDuration(
                                  visit.duration
                                )}
                              </small>
                            </div>

                            <div className="history-duration">
                              {formatDuration(
                                visit.duration
                              )}
                            </div>
                          </div>
                        )
                      )}
                    </div>
                  )}
                </section>
              );
            }
          )}
        </div>
      )}
    </div>
  );
}

export default History;
