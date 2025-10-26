chrome.runtime.onMessage.addListener((message) => {
  if (!message?.type) {
    return;
  }

  const info = message.payload ?? {};

  if (message.type === "BOOKMARK_DETECTED") {
    console.log("[X Bookmark Detector] Bookmark detected", info);
  }

  if (message.type === "BOOKMARK_REMOVED") {
    console.log("[X Bookmark Detector] Bookmark removed", info);
  }
});
