import { SongController } from "../controllers/songController";
import { BaseRoute } from "./abstract/baseRoute";

export class SongRoutes extends BaseRoute {
  private songController = new SongController();

  protected initializeRoutes(): void {
    this.router.get("/songs", (req, res) =>
      this.songController.listSongs(req, res),
    );

    this.router.get("/songs/:id/stream", (req, res) => {
      this.songController.streamSong(req, res);
    });
  }
}
