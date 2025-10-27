import { sendDiscordReminder } from "./discord/webhookClient.js";

const CHANNEL_HANDLERS = {
  discord: sendDiscordReminder,
};

export const sendReminder = async ({ channel, bookmarks, context } = {}) => {
  if (!channel) {
    throw new Error("sendReminder requires a channel parameter");
  }

  if (!Array.isArray(bookmarks) || bookmarks.length === 0) {
    throw new Error("sendReminder requires at least one bookmark");
  }

  const handler = CHANNEL_HANDLERS[channel];

  if (!handler) {
    throw new Error(`No handler registered for channel '${channel}'`);
  }

  return handler({ bookmarks, context });
};

export default sendReminder;
