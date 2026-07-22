import { PrismaClient } from "@/app/generated/prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";

// global storage
const globalForPrisma = globalThis;

// Turso / libSQL adapter：
//   本機 → DATABASE_URL = "file:./dev.db"（authToken 為 undefined，沒差）
//   雲端 → DATABASE_URL = Turso 的 libsql://... + TURSO_AUTH_TOKEN
const adapter = new PrismaLibSql({
  url: process.env.DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

// 有現成的就用，沒有才新建（單例）
const prisma = globalForPrisma.prisma || new PrismaClient({ adapter });

// reuse
if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

export default prisma;
