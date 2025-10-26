const REQUEST_PATTERNS = {
  create: [
    "*://x.com/i/api/graphql/*/CreateBookmark",
    "*://*.x.com/i/api/graphql/*/CreateBookmark",
    "*://twitter.com/i/api/graphql/*/CreateBookmark",
    "*://*.twitter.com/i/api/graphql/*/CreateBookmark",
  ],
  delete: [
    "*://x.com/i/api/graphql/*/DeleteBookmark",
    "*://*.x.com/i/api/graphql/*/DeleteBookmark",
    "*://twitter.com/i/api/graphql/*/DeleteBookmark",
    "*://*.twitter.com/i/api/graphql/*/DeleteBookmark",
  ],
};

const ALL_ENDPOINTS = [...REQUEST_PATTERNS.create, ...REQUEST_PATTERNS.delete];
const BACKEND_URL = "http://localhost:3000";

const decodeBody = (raw) => {
  if (!raw || !raw.bytes) {
    return null;
  }
  try {
    return new TextDecoder().decode(raw.bytes);
  } catch (error) {
    console.warn("Failed to decode request body", error);
    return null;
  }
};

const extractTweetId = (bodyText) => {
  if (!bodyText) {
    return null;
  }
  try {
    const payload = JSON.parse(bodyText);
    return payload?.variables?.tweet_id ?? null;
  } catch (error) {
    console.warn("Failed to parse request body", error);
    return null;
  }
};

const sendToTab = (tabId, message) => {
  if (typeof tabId !== "number" || tabId < 0) {
    return;
  }
  chrome.tabs.sendMessage(tabId, message, () => {
    if (chrome.runtime.lastError) {
      console.debug("Unable to deliver bookmark message", chrome.runtime.lastError);
    }
  });
};

const syncToBackend = async (action, payload) => {
  if (!payload?.tweetId || !BACKEND_URL) {
    return;
  }

  try {
    if (action === "create") {
      const response = await fetch(`${BACKEND_URL}/bookmarks`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          tweetId: payload.tweetId,
          title: payload.title,
          source: payload.url,
        }),
      });

      if (!response.ok) {
        const text = await response.text();
        console.warn("Failed to sync bookmark create", response.status, text);
      }
    } else if (action === "delete") {
      const response = await fetch(
        `${BACKEND_URL}/bookmarks/${encodeURIComponent(payload.tweetId)}`,
        {
          method: "DELETE",
        },
      );

      if (!response.ok) {
        const text = await response.text();
        console.warn("Failed to sync bookmark delete", response.status, text);
      }
    }
  } catch (error) {
    console.error("Error calling backend", error);
  }
};

const determineAction = (url) => {
  if (url.includes("/CreateBookmark")) {
    return "create";
  }
  if (url.includes("/DeleteBookmark")) {
    return "delete";
  }
  return null;
};

chrome.webRequest.onBeforeRequest.addListener(
  (details) => {
    const action = determineAction(details.url);
    if (!action) {
      return;
    }

    const bodyText = decodeBody(details.requestBody?.raw?.[0]);
    const tweetId = extractTweetId(bodyText);
    const timestamp = new Date().toISOString();

    const payload = {
      time: timestamp,
      url: details.url,
      tweetId,
    };

    if (!tweetId) {
      console.warn("Bookmark event missing tweetId", {
        action,
        url: details.url,
      });
      return;
    }

    const messageType =
      action === "create" ? "BOOKMARK_DETECTED" : "BOOKMARK_REMOVED";

    console.log(`[X Bookmark Detector] Bookmark ${action}`, payload);

    sendToTab(details.tabId, {
      type: messageType,
      payload,
    });

    syncToBackend(action, payload);
  },
  { urls: ALL_ENDPOINTS, types: ["xmlhttprequest"] },
  ["requestBody"],
);
