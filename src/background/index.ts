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
import {
  isTrackingEnabled,
} from "../storage/trackingState";

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
  const session =
    await endSession(tabId);

  if (session) {
    await saveVisit(session);
  }
}

async function handleWebsite(
  tabId: number,
  url?: string
): Promise<void> {
  // IMPORTANT:
  // Never track anything while tracking is paused.
  const trackingEnabled =
    await isTrackingEnabled();

  if (!trackingEnabled) {


    return;
  }

  const domain = detectDomain(url);

  if (!domain) {
    console.log("Ignored URL:", url);

    await saveEndedSession(tabId);

    return;
  }

  const website =
    classifyWebsite(domain);

  const currentSession =
    await getSession(tabId);

  // Same website in same tab = same visit.
  if (
    currentSession?.domain === domain
  ) {


    return;
  }

  // End previous website session.
  if (currentSession) {
    await saveEndedSession(tabId);
  }

  const activeTabId =
    await getActiveTabId();

  // Only track the currently active tab.
  if (activeTabId === tabId) {
    await startSession(
      tabId,
      domain,
      website.name,
      website.category
    );
  }
}



// =====================================================
// TAB ACTIVATION
// =====================================================

chrome.tabs.onActivated.addListener(
  async (activeInfo) => {
    try {
      const trackingEnabled =
        await isTrackingEnabled();

      // If paused, do not start a new session.
      if (!trackingEnabled) {


        await setActiveTab(
          activeInfo.tabId
        );

        return;
      }

      const previousTabId =
        await getActiveTabId();

      if (
        previousTabId !== null &&
        previousTabId !== activeInfo.tabId
      ) {
        await saveEndedSession(
          previousTabId
        );
      }

      await setActiveTab(
        activeInfo.tabId
      );

      const tab =
        await chrome.tabs.get(
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

// =====================================================
// PAGE NAVIGATION / LOAD
// =====================================================

chrome.tabs.onUpdated.addListener(
  async (
    tabId,
    changeInfo,
    tab
  ) => {
    if (
      changeInfo.status !== "complete"
    ) {
      return;
    }

    const trackingEnabled =
      await isTrackingEnabled();

    if (!trackingEnabled) {


      return;
    }

    await handleWebsite(
      tabId,
      tab.url
    );
  }
);

// =====================================================
// TAB CLOSED
// =====================================================

chrome.tabs.onRemoved.addListener(
  async (tabId) => {
    try {
      const session =
        await removeTab(tabId);

      if (session) {
        await saveVisit(session);
      }
    } catch (error) {
      console.error(
        "Failed to save closed-tab session:",
        error
      );
    }
  }
);

// =====================================================
// RECOVER ACTIVE TAB AFTER SERVICE WORKER RESTART
// =====================================================

async function initializeActiveTab(): Promise<void> {
  try {
    const trackingEnabled =
      await isTrackingEnabled();

    if (!trackingEnabled) {


      return;
    }

    const tabs =
      await chrome.tabs.query({
        active: true,
        lastFocusedWindow: true,
      });

    const activeTab = tabs[0];

    if (!activeTab?.id) {
      return;
    }

    await setActiveTab(
      activeTab.id
    );

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

// =====================================================
// TRACKING STATE CHANGES
// =====================================================

chrome.storage.onChanged.addListener(
  async (changes, areaName) => {
    if (
      areaName !== "local" ||
      !changes.trackingEnabled
    ) {
      return;
    }

    const newValue =
      changes.trackingEnabled.newValue;



    // Tracking paused.
    if (newValue === false) {
      const activeTabId =
        await getActiveTabId();

      if (activeTabId !== null) {
        await saveEndedSession(
          activeTabId
        );
      }



      return;
    }

    // Tracking resumed.
    if (newValue === true) {


      const tabs =
        await chrome.tabs.query({
          active: true,
          lastFocusedWindow: true,
        });

      const activeTab = tabs[0];

      if (!activeTab?.id) {
        return;
      }

      await setActiveTab(
        activeTab.id
      );

      await handleWebsite(
        activeTab.id,
        activeTab.url
      );
    }
  }
);

void initializeActiveTab();
