import { createBookmarkService } from "./bookmark.service.js";
import { resolveBookmarkMetadata } from "./bookmark.metadata.service.js";
import { serializeBookmark } from "./bookmark.serializer.js";

export const buildBookmarkController = ({ prisma }) => {
  const bookmarkService = createBookmarkService(prisma);

  const listBookmarks = async () => {
    const bookmarks = await bookmarkService.list();
    return bookmarks.map(serializeBookmark);
  };

  const createOrUpdateBookmark = async (request) => {
    const { tweetId, title, source } = request.body;

    const { metadataFields, mediaUrls } = await resolveBookmarkMetadata({
      tweetId,
      source,
    });

    const bookmark = await bookmarkService.upsert({
      tweetId,
      title,
      source,
      metadataFields,
      mediaUrls,
    });

    return serializeBookmark(bookmark);
  };

  const deleteBookmark = async (request, reply) => {
    const { tweetId } = request.params;

    try {
      await bookmarkService.deleteByTweetId(tweetId);
    } catch (error) {
      if (error?.code === "P2025") {
        reply.code(404);
        return { success: false };
      }

      throw error;
    }

    return { success: true };
  };

  const updateBookmarkReadStatus = async (request, reply) => {
    const { tweetId } = request.params;
    const read = request.body?.read ?? true;

    try {
      const bookmark = await bookmarkService.updateReadStatus({
        tweetId,
        read,
      });

      return serializeBookmark(bookmark);
    } catch (error) {
      if (error?.code === "P2025") {
        reply.code(404);
        return { message: "Bookmark not found" };
      }

      throw error;
    }
  };

  return {
    listBookmarks,
    createOrUpdateBookmark,
    deleteBookmark,
    updateBookmarkReadStatus,
  };
};
