export const createBookmarkService = (prisma) => {
  const repository = prisma.bookmark;

  return {
    list: () =>
      repository.findMany({
        orderBy: { createdAt: "desc" },
      }),

    upsert: ({ tweetId, title, source, metadataFields, mediaUrls }) =>
      repository.upsert({
        where: { tweetId },
        update: {
          title,
          source,
          ...metadataFields,
          mediaUrls: { set: mediaUrls },
        },
        create: {
          tweetId,
          title,
          source,
          ...metadataFields,
          mediaUrls,
        },
      }),

    deleteByTweetId: (tweetId) =>
      repository.delete({
        where: { tweetId },
      }),

    updateReadStatus: ({ tweetId, read }) =>
      repository.update({
        where: { tweetId },
        data: { readAt: read ? new Date() : null },
      }),
  };
};
