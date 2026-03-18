import { plainToInstance } from "class-transformer";
import { UserDto } from "../dto/UserDto";
import { User } from "../types";
import { AbstractService } from "./abstractService";
import { validate } from "class-validator";
import { HashHelper } from "../helpers/hash";
import jwt from "jsonwebtoken";

export class AuthService extends AbstractService {
  public async register(user: User) {
    const dto = plainToInstance(UserDto, user);
    const errors = await validate(dto);

    if (errors.length > 0) {
      throw new Error(
        errors.map((e) => Object.values(e.constraints ?? {})).join(", "),
      );
    }

    return this.prismaClient.user.create({
      data: {
        name: user.name,
        email: user.email,
        password: await HashHelper.hash(user.password),
      },
    });
  }

  public async authenticate(email: string, password: string) {
    const user = await this.prismaClient.user.findUnique({ where: { email } });

    if (!user) {
      throw new Error("User not found");
    }

    const valid = await HashHelper.compare(password, user.password);

    if (!valid) {
      throw new Error("Invalid credentials");
    }

    const token = jwt.sign(
      {
        id: user.id,
        user: { id: user.id, name: user.name, email: user.email },
      },
      process.env.JWT_SECRET!,
      { expiresIn: "1h" },
    );

    return { token, user };
  }
}
