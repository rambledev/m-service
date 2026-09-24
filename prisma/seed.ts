// Seed script — populates the reference data the app needs to function: the category taxonomy
// and the bootstrap admin/technician accounts (lib/roles.ts). Does NOT seed any demo/mock
// tickets — the app is live with real users now, and ticket data lives entirely in Postgres.
// Run with: npm run db:seed  (or: npx prisma db seed)

import { PrismaClient, Prisma } from "@prisma/client";
import { categories } from "../mock/categories";
import { initialUsers } from "../mock/users";
import type { Role } from "../lib/types";

const prisma = new PrismaClient();

const roleMap: Record<Role, Prisma.UserCreateInput["role"]> = {
  requester: "REQUESTER",
  technician: "TECHNICIAN",
  admin: "ADMIN",
};

async function main() {
  console.log("[seed] categories...");
  for (const category of categories) {
    await prisma.category.upsert({
      where: { id: category.id },
      create: category,
      update: category,
    });
  }

  console.log("[seed] bootstrap users...");
  for (const user of initialUsers) {
    await prisma.user.upsert({
      where: { id: user.id },
      create: {
        id: user.id,
        name: user.name,
        role: roleMap[user.role],
        department: user.department,
        phone: user.phone,
        expertise: user.expertise ?? [],
      },
      update: {
        role: roleMap[user.role],
      },
    });
  }

  console.log(`[seed] done: ${categories.length} categories, ${initialUsers.length} bootstrap users`);
}

main()
  .catch((error) => {
    console.error("[seed] failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
