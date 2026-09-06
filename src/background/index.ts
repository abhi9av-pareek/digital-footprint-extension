import { classifyWebsite } from "../category/classifier";
import { saveVisit } from "../storage/activityStore";


import {
  endSession,
  getActiveTabId,
  getSession,
  removeTab,
  setActiveTab,
  startSession,
} from "./sessionTracker";

function detectDomain(
  url?: string
): string | null {
  if (!url) {
    return null;
  }

  try {
    const parsedUrl = new URL(url);

    if (
      parsedUrl.protocol !== "http:" &&
      parsedUrl.protocol !== "https:"
    ) {
      return null;
    }

    return parsedUrl.hostname.replace(
      /^www\./,
      ""
    );
  } catch {
    return null;
  }
}

async function saveEndedSession(
  tabId: number
): Promise<void> {
  const session = endSession(tabId);

  if (session) {
    await saveVisit(session);
  }
}

async function handleWebsite(
  tabId: number,
  url?: string
): Promise<void> {
  const domain = detectDomain(url);

  if (!domain) {
    console.log("Ignored URL:", url);

    await saveEndedSession(tabId);

    return;
  }

  const website = classifyWebsite(domain);
  const currentSession = getSession(tabId);

  // Same website in the same tab.
  if (currentSession?.domain === domain) {
    console.log(
      "↔️ Same session:",
      domain
    );

    return;
  }

  // The tab navigated to another website.
  if (currentSession) {
    await saveEndedSession(tabId);
  }

  // Start the new website session.
  // The session starts only when this tab becomes active.
  if (
    getActiveTabId() === tabId
  ) {
    startSession(
      tabId,
      domain,
      website.name,
      website.category
    );
  }
}

console.log(
  "🚀 Digital Footprint background service started"
);

// User switches tabs.
chrome.tabs.onActivated.addListener(
  async (activeInfo) => {
    try {
      const previousTabId =
        getActiveTabId();

      // End the previous active tab's session.
      if (
        previousTabId !== null &&
        previousTabId !== activeInfo.tabId
      ) {
        await saveEndedSession(
          previousTabId
        );
      }

      // Mark new tab as active.
      setActiveTab(
        activeInfo.tabId
      );

      const tab = await chrome.tabs.get(
        activeInfo.tabId
      );

      await handleWebsite(
        activeInfo.tabId,
        tab.url
      );
    } catch (error) {
      console.error(
        "Failed to handle tab activation:",
        error
      );
    }
  }
);

// User navigates inside a tab.
chrome.tabs.onUpdated.addListener(
  async (
    tabId,
    changeInfo,
    tab
  ) => {
    if (
      changeInfo.status === "complete"
    ) {
      await handleWebsite(
        tabId,
        tab.url
      );
    }
  }
);

// User closes a tab.
chrome.tabs.onRemoved.addListener(
  async (tabId) => {
    const session =
      removeTab(tabId);

    if (session) {
      await saveVisit(session);
    }
  }
);

// Recover the currently active tab
// when the service worker starts.
async function initializeActiveTab(): Promise<void> {
  try {
    const tabs =
      await chrome.tabs.query({
        active: true,
        lastFocusedWindow: true,
      });

    const activeTab = tabs[0];

    if (!activeTab?.id) {
      return;
    }

    setActiveTab(activeTab.id);

    await handleWebsite(
      activeTab.id,
      activeTab.url
    );
  } catch (error) {
    console.error(
      "Failed to initialize active tab:",
      error
    );
  }
}

void initializeActiveTab();
