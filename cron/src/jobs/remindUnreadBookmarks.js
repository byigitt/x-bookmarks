import prisma from "database";
import { sendReminder } from "integrations";

const DEFAULT_THRESHOLD_HOURS = 24;
const DEFAULT_CHANNEL = "discord";

const parseNumberEnv = (value, fallback) => {
  if (value === undefined) {
    return fallback;
  }

  const parsed = Number(value);

  if (Number.isFinite(parsed) && parsed > 0) {
    return parsed;
  }

  return fallback;
};

export const remindUnreadBookmarks = async ({ now = new Date(), channel } = {}) => {
  const started = Date.now();

  const thresholdHours = parseNumberEnv(process.env.REMINDER_THRESHOLD_HOURS, DEFAULT_THRESHOLD_HOURS);
  const batchSize = parseNumberEnv(process.env.REMINDER_BATCH_SIZE, 10);
  const selectedChannel = channel ?? process.env.REMINDER_CHANNEL ?? DEFAULT_CHANNEL;

  const thresholdMs = thresholdHours * 60 * 60 * 1000;
  const cutoffDate = new Date(now.getTime() - thresholdMs);

  const bookmarks = await prisma.bookmark.findMany({
    where: {
      readAt: null,
      createdAt: { lt: cutoffDate },
      OR: [
        { lastReminderSentAt: null },
        { lastReminderSentAt: { lt: cutoffDate } },
      ],
    },
    orderBy: { createdAt: "asc" },
    take: batchSize,
  });

  if (bookmarks.length === 0) {
    return { sent: 0, skipped: true, durationMs: Date.now() - started };
  }

  await sendReminder({ channel: selectedChannel, bookmarks });

  const bookmarkIds = bookmarks.map((bookmark) => bookmark.id);
  await prisma.bookmark.updateMany({
    where: { id: { in: bookmarkIds } },
    data: { lastReminderSentAt: now },
  });

  return { sent: bookmarks.length, skipped: false, durationMs: Date.now() - started };
};

export default remindUnreadBookmarks;
