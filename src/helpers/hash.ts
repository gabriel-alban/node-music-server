import bcrypt from "bcrypt";

export class HashHelper {
  public static hash(password: string): Promise<string> {
    return bcrypt.hash(password, 10);
  }

  public static compare(
    password: string,
    hashedPassword: string,
  ): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword);
  }
}
