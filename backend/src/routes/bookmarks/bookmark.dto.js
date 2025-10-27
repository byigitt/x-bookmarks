export const bookmarkBodySchema = {
  type: "object",
  required: ["tweetId"],
  properties: {
    tweetId: { type: "string", minLength: 1 },
    title: { type: "string" },
    source: { type: "string" },
  },
  additionalProperties: false,
};

export const bookmarkParamsSchema = {
  type: "object",
  required: ["tweetId"],
  properties: {
    tweetId: { type: "string", minLength: 1 },
  },
};

export const bookmarkReadBodySchema = {
  type: "object",
  properties: {
    read: { type: "boolean" },
  },
  additionalProperties: false,
};

export const bookmarkResponseSchema = {
  type: "object",
  properties: {
    id: { type: "number" },
    tweetId: { type: "string" },
    title: { type: ["string", "null"] },
    source: { type: ["string", "null"] },
    fxUrl: { type: ["string", "null"] },
    text: { type: ["string", "null"] },
    authorName: { type: ["string", "null"] },
    authorUsername: { type: ["string", "null"] },
    authorAvatarUrl: { type: ["string", "null"] },
    thumbnailUrl: { type: ["string", "null"] },
    mediaUrls: {
      type: "array",
      items: { type: "string" },
    },
    metrics: {
      anyOf: [
        { type: "null" },
        {
          type: "object",
          additionalProperties: { type: "number" },
        },
      ],
    },
    readAt: { type: ["string", "null"] },
    isRead: { type: "boolean" },
    createdAt: { type: "string" },
    updatedAt: { type: "string" },
  },
};

export const listBookmarksSchema = {
  response: {
    200: {
      type: "array",
      items: bookmarkResponseSchema,
    },
  },
};

export const createBookmarkSchema = {
  body: bookmarkBodySchema,
  response: {
    200: bookmarkResponseSchema,
  },
};

export const deleteBookmarkResponseSchema = {
  type: "object",
  properties: {
    success: { type: "boolean" },
  },
};

export const deleteBookmarkSchema = {
  params: bookmarkParamsSchema,
  response: {
    200: deleteBookmarkResponseSchema,
    404: deleteBookmarkResponseSchema,
  },
};

export const notFoundResponseSchema = {
  type: "object",
  properties: {
    message: { type: "string" },
  },
  required: ["message"],
};

export const updateBookmarkReadSchema = {
  params: bookmarkParamsSchema,
  body: bookmarkReadBodySchema,
  response: {
    200: bookmarkResponseSchema,
    404: notFoundResponseSchema,
  },
};
