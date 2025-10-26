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
    createdAt: { type: "string" },
    updatedAt: { type: "string" },
  },
};

const registerRoutes = async (fastify) => {
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

      return bookmark;
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
};

export default registerRoutes;
