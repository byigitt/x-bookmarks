import Fastify from "fastify";
import cors from "@fastify/cors";
import prismaPlugin from "./plugins/prisma.js";
import registerBookmarkRoutes from "./routes/bookmarks/index.js";

const buildServer = () => {
  const server = Fastify({
    logger: true,
  });

  const corsOrigins = process.env.EXTENSION_ORIGIN
    ? process.env.EXTENSION_ORIGIN.split(",").map((origin) => origin.trim())
    : true;

  server.register(cors, {
    origin: corsOrigins,
    methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
  });

  server.register(prismaPlugin);

  server.get("/", async () => ({
    status: "ok",
    message: "Fastify backend is running",
  }));

  server.register(registerBookmarkRoutes, {
    prefix: "/bookmarks",
  });

  return server;
};

const start = async () => {
  const server = buildServer();
  const port = Number(process.env.PORT ?? 3000);
  const host = "0.0.0.0";

  try {
    await server.listen({ port, host });
    console.log(`Fastify server listening on http://${host}:${port}`);
  } catch (error) {
    server.log.error(error);
    process.exit(1);
  }

  const close = async () => {
    try {
      await server.close();
      process.exit(0);
    } catch (error) {
      server.log.error(error);
      process.exit(1);
    }
  };

  process.on("SIGINT", close);
  process.on("SIGTERM", close);
};

start();
