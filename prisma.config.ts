import { config } from "dotenv";
import { defineConfig } from "prisma/config";

// Läs .env.local (Next.js-standard) istället för .env
config({ path: ".env.local" });

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: process.env.DATABASE_URL!,
  },
});
