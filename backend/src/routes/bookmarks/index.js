import {
  listBookmarksSchema,
  createBookmarkSchema,
  deleteBookmarkSchema,
  updateBookmarkReadSchema,
} from "./bookmark.dto.js";
import { buildBookmarkController } from "./bookmark.controller.js";

const registerBookmarkRoutes = async (fastify) => {
  const controller = buildBookmarkController({
    prisma: fastify.prisma,
  });

  fastify.get(
    "/",
    {
      schema: listBookmarksSchema,
    },
    controller.listBookmarks,
  );

  fastify.post(
    "/",
    {
      schema: createBookmarkSchema,
    },
    controller.createOrUpdateBookmark,
  );

  fastify.delete(
    "/:tweetId",
    {
      schema: deleteBookmarkSchema,
    },
    controller.deleteBookmark,
  );

  fastify.patch(
    "/:tweetId/read",
    {
      schema: updateBookmarkReadSchema,
    },
    controller.updateBookmarkReadStatus,
  );
};

export default registerBookmarkRoutes;
