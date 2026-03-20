import multer from "multer";

import { AdminSongsController } from "../../controllers/admin/songsController";
import { BaseRoute } from "../abstract/baseRoute";
import { authMiddleware } from "../../middleware/authMiddleware";

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 2 * 1024 * 1024, // 1MB per chunk
  },
});

export class AdminSongsRoutes extends BaseRoute {
  public songController = new AdminSongsController();

  protected initializeRoutes(): void {
    this.router.post(
      "/admin/songs",
      authMiddleware,
      upload.single("chunk"),
      (req, res) => this.songController.store(req, res),
    );

    this.router.post("/admin/songs/complete", authMiddleware, (req, res) =>
      this.songController.complete(req, res),
    );
  }
}
