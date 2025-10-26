const bookmarkBodySchema = {
  type: "object",
  required: ["tweetId"],
  properties: {
    tweetId: { type: "string", minLength: 1 },
    title: { type: "string" },
    source: { type: "string" },
  },
  additionalProperties: false,
};

const bookmarkResponseSchema = {
  type: "object",
  properties: {
    id: { type: "number" },
    tweetId: { type: "string" },
    title: { type: ["string", "null"] },
    source: { type: ["string", "null"] },
    readAt: { type: ["string", "null"] },
    isRead: { type: "boolean" },
    createdAt: { type: "string" },
    updatedAt: { type: "string" },
  },
};

const serializeBookmark = (bookmark) => ({
  id: bookmark.id,
  tweetId: bookmark.tweetId,
  title: bookmark.title,
  source: bookmark.source,
  readAt: bookmark.readAt ? bookmark.readAt.toISOString() : null,
  isRead: Boolean(bookmark.readAt),
  createdAt: bookmark.createdAt.toISOString(),
  updatedAt: bookmark.updatedAt.toISOString(),
});

const registerRoutes = async (fastify) => {
  fastify.get(
    "/",
    {
      schema: {
        response: {
          200: {
            type: "array",
            items: bookmarkResponseSchema,
          },
        },
      },
    },
    async () => {
      const bookmarks = await fastify.prisma.bookmark.findMany({
        orderBy: { createdAt: "desc" },
      });

      return bookmarks.map(serializeBookmark);
    },
  );

  fastify.post(
    "/",
    {
      schema: {
        body: bookmarkBodySchema,
        response: {
          200: bookmarkResponseSchema,
        },
      },
    },
    async (request, reply) => {
      const { tweetId, title, source } = request.body;

      const bookmark = await fastify.prisma.bookmark.upsert({
        where: { tweetId },
        update: { title, source },
        create: { tweetId, title, source },
      });

      return serializeBookmark(bookmark);
    },
  );

  fastify.delete(
    "/:tweetId",
    {
      schema: {
        params: {
          type: "object",
          required: ["tweetId"],
          properties: {
            tweetId: { type: "string", minLength: 1 },
          },
        },
        response: {
          200: {
            type: "object",
            properties: {
              success: { type: "boolean" },
            },
          },
        },
      },
    },
    async (request, reply) => {
      const { tweetId } = request.params;

      try {
        await fastify.prisma.bookmark.delete({ where: { tweetId } });
      } catch (error) {
        if (error.code === "P2025") {
          reply.code(404);
          return { success: false };
        }
        throw error;
      }

      return { success: true };
    },
  );

  fastify.patch(
    "/:tweetId/read",
    {
      schema: {
        params: {
          type: "object",
          required: ["tweetId"],
          properties: {
            tweetId: { type: "string", minLength: 1 },
          },
        },
        body: {
          type: "object",
          properties: {
            read: { type: "boolean" },
          },
          additionalProperties: false,
        },
        response: {
          200: bookmarkResponseSchema,
          404: {
            type: "object",
            properties: {
              message: { type: "string" },
            },
            required: ["message"],
          },
        },
      },
    },
    async (request, reply) => {
      const { tweetId } = request.params;
      const read = request.body?.read ?? true;

      let bookmark;

      try {
        bookmark = await fastify.prisma.bookmark.update({
          where: { tweetId },
          data: { readAt: read ? new Date() : null },
        });
      } catch (error) {
        if (error.code === "P2025") {
          reply.code(404);
          return { message: "Bookmark not found" };
        }
        throw error;
      }

      return serializeBookmark(bookmark);
    },
  );
};

export default registerRoutes;
