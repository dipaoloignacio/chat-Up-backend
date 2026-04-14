import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "bun ./prisma/seed/seed.ts",  // ← esto
  },
  datasource: {
    url: process.env["DATABASE_URL"],
  },
});