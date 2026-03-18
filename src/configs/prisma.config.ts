export const prismaConfig = {
  databaseUrl:
    process.env.DATABASE_URL || "postgresql://USER:PASSWORD@HOST:PORT/DATABASE",
};
