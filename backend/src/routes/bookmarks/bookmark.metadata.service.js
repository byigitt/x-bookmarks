import { fetchTweetMetadata } from "../../services/tweetMetadata.js";

export const resolveBookmarkMetadata = async ({ tweetId, source }) => {
  const metadata = await fetchTweetMetadata({ tweetId, sourceUrl: source });

  return {
    metadataFields: {
      fxUrl: metadata.fxUrl ?? null,
      text: metadata.text ?? null,
      authorName: metadata.authorName ?? null,
      authorUsername: metadata.authorUsername ?? null,
      authorAvatarUrl: metadata.authorAvatarUrl ?? null,
      thumbnailUrl: metadata.thumbnailUrl ?? null,
      metrics: metadata.metrics ?? null,
    },
    mediaUrls: metadata.mediaUrls ?? [],
  };
};
