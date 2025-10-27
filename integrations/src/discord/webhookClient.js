const DISCORD_MAX_EMBEDS = 10;
const DISCORD_COLOR_INFO = 0x5865f2;

const truncate = (value, maxLength) => {
  if (!value) {
    return undefined;
  }

  if (value.length <= maxLength) {
    return value;
  }

  return `${value.slice(0, maxLength - 1)}…`;
};

const formatMetrics = (metrics) => {
  if (!metrics || Object.keys(metrics).length === 0) {
    return undefined;
  }

  return Object.entries(metrics)
    .map(([key, value]) => `${key}: ${value}`)
    .join(" • ");
};

const fallbackTweetUrl = (tweetId) => `https://x.com/i/web/status/${tweetId}`;

const toDiscordEmbed = (bookmark) => {
  const description = truncate(bookmark.text ?? bookmark.title, 3900);
  const metrics = formatMetrics(bookmark.metrics);
  const title = bookmark.title ?? `Tweet ${bookmark.tweetId}`;

  const authorNameParts = [];

  if (bookmark.authorName) {
    authorNameParts.push(bookmark.authorName);
  }

  if (bookmark.authorUsername) {
    authorNameParts.push(`@${bookmark.authorUsername}`);
  }

  const embed = {
    title: truncate(title, 250),
    url: bookmark.fxUrl ?? fallbackTweetUrl(bookmark.tweetId),
    description,
    color: DISCORD_COLOR_INFO,
    timestamp: bookmark.createdAt?.toISOString?.() ?? bookmark.createdAt ?? undefined,
    footer: {
      text: `Bookmark #${bookmark.id}`,
    },
    fields: [],
  };

  if (authorNameParts.length > 0 || bookmark.authorAvatarUrl) {
    embed.author = {
      name: truncate(authorNameParts.join(" · "), 256),
      icon_url: bookmark.authorAvatarUrl ?? undefined,
    };
  }

  const primaryMedia = bookmark.thumbnailUrl ?? bookmark.mediaUrls?.[0];

  if (primaryMedia) {
    embed.thumbnail = { url: primaryMedia };
  }

  if (bookmark.source) {
    embed.fields.push({ name: "Source", value: truncate(bookmark.source, 1024), inline: false });
  }

  if (metrics) {
    embed.fields.push({ name: "Metrics", value: truncate(metrics, 1024), inline: false });
  }

  return embed;
};

const chunk = (items, size) => {
  const chunks = [];

  for (let index = 0; index < items.length; index += size) {
    chunks.push(items.slice(index, index + size));
  }

  return chunks;
};

export const sendDiscordReminder = async ({ bookmarks, context }) => {
  const webhookUrl = process.env.DISCORD_WEBHOOK_URL;

  if (!webhookUrl) {
    throw new Error("DISCORD_WEBHOOK_URL is not defined");
  }

  const embeds = bookmarks.map(toDiscordEmbed);
  const batches = chunk(embeds, DISCORD_MAX_EMBEDS);
  const createdAt = bookmarks[0]?.createdAt ?? null;

  for (let index = 0; index < batches.length; index += 1) {
    const payload = {
      content:
        index === 0
          ? `🔔 You have ${bookmarks.length} unread bookmark${bookmarks.length === 1 ? "" : "s"} awaiting review.`
          : undefined,
      embeds: batches[index],
    };

    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => "");
      throw new Error(
        `Discord webhook request failed with status ${response.status}: ${truncate(errorText, 1800) ?? ""}`,
      );
    }
  }

  return {
    delivered: embeds.length,
    context,
    firstBookmarkCreatedAt: createdAt?.toISOString?.() ?? createdAt ?? null,
  };
};

export default sendDiscordReminder;
