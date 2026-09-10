import type { VisitSession } from "../shared/types";

export interface ActiveSession extends VisitSession {
  tabId: number;
}

const ACTIVE_SESSIONS_KEY = "activeSessions";
const ACTIVE_TAB_KEY = "activeTabId";

async function getStoredSessions(): Promise<
  Record<number, ActiveSession>
> {
  const result = await chrome.storage.local.get(
    ACTIVE_SESSIONS_KEY
  );

  return (
    result[ACTIVE_SESSIONS_KEY] as
      | Record<number, ActiveSession>
      | undefined
  ) ?? {};
}

async function setStoredSessions(
  sessions: Record<number, ActiveSession>
): Promise<void> {
  await chrome.storage.local.set({
    [ACTIVE_SESSIONS_KEY]: sessions,
  });
}

export async function setActiveTab(
  tabId: number
): Promise<void> {
  await chrome.storage.local.set({
    [ACTIVE_TAB_KEY]: tabId,
  });
}

export async function getActiveTabId(): Promise<
  number | null
> {
  const result = await chrome.storage.local.get(
    ACTIVE_TAB_KEY
  );

  return (
    (result[ACTIVE_TAB_KEY] as
      | number
      | undefined) ?? null
  );
}

export async function startSession(
  tabId: number,
  domain: string,
  websiteName: string,
  category: VisitSession["category"]
): Promise<ActiveSession> {
  const sessions =
    await getStoredSessions();

  const session: ActiveSession = {
    id: crypto.randomUUID(),
    tabId,
    domain,
    websiteName,
    category,
    startedAt: Date.now(),
    endedAt: null,
  };

  sessions[tabId] = session;

  await setStoredSessions(sessions);



  return session;
}

export async function getSession(
  tabId: number
): Promise<ActiveSession | null> {
  const sessions =
    await getStoredSessions();

  return sessions[tabId] ?? null;
}

export async function endSession(
  tabId: number
): Promise<ActiveSession | null> {
  const sessions =
    await getStoredSessions();

  const session = sessions[tabId];

  if (!session) {
    return null;
  }

  session.endedAt = Date.now();

  delete sessions[tabId];

  await setStoredSessions(sessions);


  return session;
}

export async function removeTab(
  tabId: number
): Promise<ActiveSession | null> {
  const session =
    await endSession(tabId);

  const activeTabId =
    await getActiveTabId();

  if (activeTabId === tabId) {
    await chrome.storage.local.remove(
      ACTIVE_TAB_KEY
    );
  }

  return session;
}
