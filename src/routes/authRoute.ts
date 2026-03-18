import { BaseRoute } from "./abstract/baseRoute";
import { AuthController } from "../controllers/authController";

export class AuthRoutes extends BaseRoute {
  private authController = new AuthController();

  protected initializeRoutes() {
    this.router.post("/auth/register", (req, res) => {
      this.authController.register(req, res);
    });

    this.router.post("/auth/login", (req, res) => {
      this.authController.authenticate(req, res);
    });
  }
}
