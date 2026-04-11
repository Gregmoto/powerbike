import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";
import { config } from "dotenv";

config({ path: ".env.local" });

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  const hash = await bcrypt.hash("powerbike2024!", 12);
  await prisma.user.upsert({
    where: { email: "admin@powerbike.nu" },
    update: {},
    create: {
      email: "admin@powerbike.nu",
      name: "Admin",
      passwordHash: hash,
      role: "ADMIN",
    },
  });

  const categories = [
    { name: "Motorcyklar", slug: "motorcyklar", color: "#ef4444" },
    { name: "Bilar", slug: "bilar", color: "#3b82f6" },
    { name: "Utrustning", slug: "utrustning", color: "#f59e0b" },
    { name: "Tips & Råd", slug: "tips-rad", color: "#10b981" },
  ];

  for (const cat of categories) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {},
      create: cat,
    });
  }

  console.log("✅ Seed klar!");
  console.log("👤 Admin: admin@powerbike.nu / powerbike2024!");
  console.log(`📁 ${categories.length} kategorier skapade`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
