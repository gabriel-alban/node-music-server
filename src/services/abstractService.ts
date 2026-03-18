import { PrismaClient } from "@prisma/client";

export abstract class AbstractService {
  protected prismaClient = new PrismaClient();
}
