import type { VisitSession } from "../shared/types";

export interface ActiveSession extends VisitSession {
  tabId: number;
}

const sessions = new Map<number, ActiveSession>();

let activeTabId: number | null = null;

export function setActiveTab(tabId: number): void {
  activeTabId = tabId;
}

export function getActiveTabId(): number | null {
  return activeTabId;
}

export function startSession(
  tabId: number,
  domain: string,
  websiteName: string,
  category: VisitSession["category"]
): ActiveSession {
  const now = Date.now();

  const session: ActiveSession = {
    id: crypto.randomUUID(),
    tabId,
    domain,
    websiteName,
    category,
    startedAt: now,
    endedAt: null,
  };

  sessions.set(tabId, session);

  console.log("🟢 Session started:", {
    tabId,
    website: websiteName,
    domain,
    category,
  });

  return session;
}

export function endSession(
  tabId: number
): ActiveSession | null {
  const session = sessions.get(tabId);

  if (!session) {
    return null;
  }

  session.endedAt = Date.now();

  sessions.delete(tabId);

  console.log("🔴 Session ended:", {
    tabId,
    website: session.websiteName,
    domain: session.domain,
    duration:
      session.endedAt - session.startedAt,
  });

  return session;
}

export function getSession(
  tabId: number
): ActiveSession | null {
  return sessions.get(tabId) ?? null;
}

export function removeTab(
  tabId: number
): ActiveSession | null {
  const session = endSession(tabId);

  if (activeTabId === tabId) {
    activeTabId = null;
  }

  return session;
}
