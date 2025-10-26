const FX_TWITTER_HOST = "fxtwitter.com";

const METRIC_ICON_MAP = {
  "💬": "replies",
  "🔁": "retweets",
  "❤️": "likes",
  "👁️": "views",
};

const META_TAG_REGEX = /<meta\s+[^>]*>/gi;
const LINK_TAG_REGEX = /<link\s+[^>]*>/gi;
const ATTRIBUTE_REGEX = /(\w+(?::\w+)?)\s*=\s*"([^"]*)"/gi;

const parseAttributes = (tag) => {
  const attributes = {};
  let match;

  while ((match = ATTRIBUTE_REGEX.exec(tag)) !== null) {
    const [_, name, value] = match;
    attributes[name.toLowerCase()] = value;
  }

  return attributes;
};

const toNumber = (rawValue) => {
  if (!rawValue) {
    return null;
  }

  const value = rawValue.trim().toUpperCase();

  const multiplier = value.endsWith("K")
    ? 1_000
    : value.endsWith("M")
      ? 1_000_000
      : value.endsWith("B")
        ? 1_000_000_000
        : 1;

  const numeric = parseFloat(multiplier === 1 ? value : value.slice(0, -1));

  if (Number.isNaN(numeric)) {
    return null;
  }

  return Math.round(numeric * multiplier);
};

const parseMetrics = (metricsString) => {
  if (!metricsString) {
    return null;
  }

  const metrics = {};
  const iconRegex = /(💬|🔁|❤️|👁️)\s*([0-9.,KMB]+)/g;
  let match;

  while ((match = iconRegex.exec(metricsString)) !== null) {
    const [, icon, value] = match;
    const key = METRIC_ICON_MAP[icon];
    const numericValue = toNumber(value);

    if (key && numericValue !== null) {
      metrics[key] = numericValue;
    }
  }

  return Object.keys(metrics).length === 0 ? null : metrics;
};

const extractMeta = (html) => {
  const meta = new Map();

  for (const tag of html.match(META_TAG_REGEX) ?? []) {
    const attributes = parseAttributes(tag);
    const key = attributes.property ?? attributes.name;
    const content = attributes.content;

    if (key && content) {
      meta.set(key.toLowerCase(), content);
    }
  }

  return meta;
};

const findLinkByRel = (html, rel, type) => {
  for (const tag of html.match(LINK_TAG_REGEX) ?? []) {
    const attributes = parseAttributes(tag);
    const relValue = attributes.rel;
    const href = attributes.href;
    const typeValue = attributes.type;

    if (!relValue || !href) {
      continue;
    }

    const rels = relValue.split(" ").map((item) => item.trim().toLowerCase());

    if (!rels.includes(rel.toLowerCase())) {
      continue;
    }

    if (type && (!typeValue || typeValue.toLowerCase() !== type.toLowerCase())) {
      continue;
    }

    return href;
  }

  return null;
};

const normalizeFxTwitterUrl = (tweetId, sourceUrl) => {
  if (sourceUrl) {
    try {
      const url = new URL(sourceUrl);

      if (url.hostname.endsWith("x.com") || url.hostname.endsWith("twitter.com")) {
        url.hostname = FX_TWITTER_HOST;

        if (url.pathname.startsWith("/i/web/")) {
          url.pathname = url.pathname.replace("/i/web", "");
        }

        return url.toString();
      }

      if (url.hostname.endsWith(FX_TWITTER_HOST)) {
        return url.toString();
      }
    } catch (error) {
      // Ignore malformed URLs and fall back to default generator.
    }
  }

  return `https://${FX_TWITTER_HOST}/i/status/${tweetId}`;
};

const splitAuthor = (rawTitle) => {
  if (!rawTitle) {
    return { authorName: null, authorUsername: null };
  }

  const match = rawTitle.match(/^(.*?)\s*\((@[\w]+)\)$/);

  if (!match) {
    return { authorName: rawTitle, authorUsername: null };
  }

  const [, name, usernameWithAt] = match;

  return {
    authorName: name.trim(),
    authorUsername: usernameWithAt.slice(1),
  };
};

export const fetchTweetMetadata = async ({ tweetId, sourceUrl }) => {
  const fxUrl = normalizeFxTwitterUrl(tweetId, sourceUrl);

  let html;

  try {
    const response = await fetch(fxUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 " +
          "(KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      },
    });

    if (!response.ok) {
      throw new Error(`FxTwitter responded with status ${response.status}`);
    }

    html = await response.text();
  } catch (error) {
    return {
      fxUrl,
      text: null,
      authorName: null,
      authorUsername: null,
      authorAvatarUrl: null,
      thumbnailUrl: null,
      mediaUrls: [],
      metrics: null,
    };
  }

  const meta = extractMeta(html);
  const description = meta.get("og:description") ?? meta.get("twitter:description") ?? null;
  const rawTitle = meta.get("og:title") ?? meta.get("twitter:title") ?? null;
  const { authorName, authorUsername: parsedUsername } = splitAuthor(rawTitle);
  const creatorHandle = meta.get("twitter:creator") ?? null;

  const authorUsername = parsedUsername ?? (creatorHandle ? creatorHandle.replace(/^@/, "") : null);
  const thumbnailUrl = meta.get("twitter:image") ?? meta.get("og:image") ?? null;
  const avatarUrl = findLinkByRel(html, "apple-touch-icon");

  const oEmbedUrl = findLinkByRel(html, "alternate", "application/json");
  let metrics = null;

  if (oEmbedUrl) {
    try {
      const response = await fetch(oEmbedUrl);

      if (response.ok) {
        const data = await response.json();
        metrics = parseMetrics(data.author_name);
      }
    } catch (error) {
      metrics = null;
    }
  }

  const mediaUrls = thumbnailUrl ? [thumbnailUrl] : [];

  return {
    fxUrl,
    text: description,
    authorName,
    authorUsername,
    authorAvatarUrl: avatarUrl,
    thumbnailUrl,
    mediaUrls,
    metrics,
  };
};

export default fetchTweetMetadata;
