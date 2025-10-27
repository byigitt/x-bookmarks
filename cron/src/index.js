import cron from "node-cron";
import dotenv from "dotenv";
import prisma from "database";
import { remindUnreadBookmarks } from "./jobs/remindUnreadBookmarks.js";

dotenv.config();

const cronSchedule = process.env.CRON_SCHEDULE ?? "0 * * * *";
const timezone = process.env.CRON_TIMEZONE ?? undefined;

const runJob = async (trigger) => {
  const startedAt = new Date();
  console.log(`[cron] Running unread reminder job (${trigger}) at ${startedAt.toISOString()}`);

  try {
    const result = await remindUnreadBookmarks({ now: startedAt });
    console.log(`[cron] Reminder completed: sent=${result.sent} skipped=${result.skipped} duration=${result.durationMs}ms`);
  } catch (error) {
    console.error("[cron] Reminder job failed", error);
  }
};

const setupGracefulShutdown = () => {
  const handleExit = async (signal) => {
    console.log(`[cron] Received ${signal}, closing Prisma connection`);
    await prisma.$disconnect();
    process.exit(0);
  };

  process.on("SIGINT", () => handleExit("SIGINT"));
  process.on("SIGTERM", () => handleExit("SIGTERM"));
};

const start = async () => {
  const runOnce = process.argv.includes("--run-once");

  if (runOnce) {
    await runJob("manual");
    await prisma.$disconnect();
    return;
  }

  console.log(`[cron] Scheduling unread reminders with pattern ${cronSchedule}`);

  cron.schedule(
    cronSchedule,
    () => {
      runJob("scheduled").catch((error) => {
        console.error("[cron] Scheduled reminder failed", error);
      });
    },
    { timezone },
  );

  if (process.env.RUN_JOB_ON_STARTUP !== "false") {
    await runJob("startup");
  }

  setupGracefulShutdown();
};

start().catch(async (error) => {
  console.error("[cron] Scheduler failed to start", error);
  await prisma.$disconnect();
  process.exit(1);
});
