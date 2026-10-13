import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

const names = [
  "Plan the week",
  "Buy groceries",
  "Water the plants",
  "Read a chapter of a book",
  "Go for a walk",
  "Clean the desk",
  "Back up important files",
  "Review the project README",
  "Organize the downloads folder",
  "Prepare lunch for tomorrow",
  "Schedule a dentist appointment",
  "Call a friend",
  "Update the monthly budget",
  "Pick a recipe to try",
  "Write down three project ideas",
];

async function main() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) throw new Error("DATABASE_URL is not configured.");

  const prisma = new PrismaClient({
    adapter: new PrismaPg({
      connectionString,
      connectionTimeoutMillis: 5000,
      options: "-c timezone=UTC",
    }),
  });

  try {
    // Stable IDs make repeated runs safe without overwriting task edits.
    const result = await prisma.task.createMany({
      data: names.map((name, index) => ({
        id: `d769a3c0-30fd-4b7b-8d95-${String(index + 1).padStart(12, "0")}`,
        name,
      })),
      skipDuplicates: true,
    });
    console.log(`Added ${result.count} example tasks. Total tasks: ${await prisma.task.count()}.`);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
