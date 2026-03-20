import { Request, Response } from "express";
import { BaseController } from "../abstract/baseController";
import { SongService } from "../../services/songService";
import { UploadedChunk } from "../../types";

export class AdminSongsController extends BaseController {
  private readonly songService = new SongService();

  public async store(req: Request, res: Response) {
    try {
      const file = (req as Request & { file?: UploadedChunk }).file;

      if (!file) {
        this.sendError(res, "Missing chunk file", 400);
        return;
      }

      const uploadId = String(req.body.uploadId || "");
      const fileName = String(req.body.fileName || file.originalname || "");
      const chunkIndex = Number(req.body.chunkIndex);
      const totalChunks = Number(req.body.totalChunks);
      const totalSize = Number(req.body.totalSize);

      const result = await this.songService.saveChunk({
        uploadId,
        fileName,
        chunkIndex,
        totalChunks,
        totalSize,
        chunk: file.buffer,
      });

      const statusCode = result.status === "completed" ? 201 : 202;
      this.sendResponse(res, result, statusCode);
    } catch (error) {
      this.sendError(res, error, 400);
    }
  }

  public async complete(req: Request, res: Response) {
    try {
      const fileName = String(req.body.fileName || "");
      const path = String(req.body.path || "");

      const result = await this.songService.completeUpload({
        fileName,
        path,
      });

      this.sendResponse(res, result, 201);
    } catch (error) {
      this.sendError(res, error, 400);
    }
  }
}
