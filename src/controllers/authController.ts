import { AuthService } from "../services/authService";
import { BaseController } from "./abstract/baseController";
import { Request, Response } from "express";

export class AuthController extends BaseController {
  private authService = new AuthService();

  public async register(req: Request, res: Response): Promise<void> {
    const { name, email, password } = req.body;
    try {
      const result = await this.authService.register({
        name,
        email,
        password,
      });
      res.status(201).json(result);
    } catch (error: unknown) {
      if (error instanceof Error) {
        res.status(400).json({ message: error.message });
      }
    }
  }

  public async authenticate(req: Request, res: Response): Promise<void> {
    const { email, password } = req.body;
    try {
      const result = await this.authService.authenticate(email, password);
      res.status(200).json(result);
    } catch (error: unknown) {
      if (error instanceof Error) {
        res.status(401).json({ message: error.message });
      }
    }
  }
}
