import { SongController } from "../controllers/songController";
import { BaseRoute } from "./abstract/baseRoute";

export class SongRoutes extends BaseRoute {
  private songController = new SongController();

  protected initializeRoutes(): void {
    this.router.get("/songs", (req, res) =>
      this.songController.getSongs(req, res),
    );
  }
}
