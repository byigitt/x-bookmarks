import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const main = async () => {
  await prisma.bookmark.upsert({
    where: { tweetId: "0000000000000000000" },
    update: {},
    create: {
      tweetId: "0000000000000000000",
      title: "Demo tweet",
      source: "seed",
    },
  });
  console.log("Seeded demo bookmark");
};

main()
  .catch((error) => {
    console.error("Seed failed", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
