import { Response, Request } from "express";
import { BaseController } from "./abstract/baseController";
import fs from "fs";
import path from "path";
import { SongService } from "../services/songService";

export class SongController extends BaseController {
  private readonly songService = new SongService();

  public async listSongs(req: Request, res: Response): Promise<void> {
    try {
      const songs = await this.songService.getAllSongs();
      this.sendResponse(res, songs, 200);
    } catch (error) {
      this.sendError(res, error, 500);
    }
  }

  // public async streamSong(req: Request, res: Response): Promise<void> {
  //   const audioPath = path.join(process.cwd(), "src/storage/old_friend.mp3");
  //   const stat = fs.statSync(audioPath);
  //   const fileSize = stat.size;

  //   const range = req.headers.range;

  //   if (!range) {
  //     const headers = {
  //       "Content-Length": fileSize,
  //       "Content-Type": "audio/mpeg",
  //       "Accept-Ranges": "bytes",
  //       "Access-Control-Allow-Origin": "*",
  //     };
  //     res.writeHead(200, headers);
  //     fs.createReadStream(audioPath).pipe(res);
  //     return;
  //   }

  //   const CHUNK_SIZE = 10 ** 6;

  //   const start = Number(range?.replace(/\D/g, ""));
  //   const end = Math.min(start + CHUNK_SIZE, fileSize - 1);

  //   const contentLength = end - start + 1;
  //   const headers = {
  //     "Content-Range": `bytes ${start}-${end}/${fileSize}`,
  //     "Accept-Ranges": "bytes",
  //     "Content-Length": contentLength,
  //     "Content-Type": "audio/mpeg",
  //     "Access-Control-Allow-Origin": "*",
  //   };

  //   res.writeHead(206, headers);
  //   const stream = fs.createReadStream(audioPath, { start, end });
  //   stream.pipe(res);
  // }
  public async streamSong(req: Request, res: Response): Promise<void> {
    try {
      const id = Number(req.params.id);
      if (!Number.isInteger(id) || id <= 0) {
        this.sendError(res, "Invalid song id", 400);
        return;
      }

      const song = await this.songService.getSongById(id);
      const audioPath = path.join(process.cwd(), song.path.replace(/^\/+/, ""));

      const stat = fs.statSync(audioPath);
      const fileSize = stat.size;
      const range = req.headers.range;

      if (!range) {
        const headers = {
          "Content-Length": fileSize,
          "Content-Type": "audio/mpeg",
          "Accept-Ranges": "bytes",
          "Access-Control-Allow-Origin": "*",
        };
        res.writeHead(200, headers);
        fs.createReadStream(audioPath).pipe(res);
        return;
      }

      const CHUNK_SIZE = 10 ** 6;
      const start = Number(range.replace(/\D/g, ""));
      const end = Math.min(start + CHUNK_SIZE, fileSize - 1);

      const contentLength = end - start + 1;
      const headers = {
        "Content-Range": `bytes ${start}-${end}/${fileSize}`,
        "Accept-Ranges": "bytes",
        "Content-Length": contentLength,
        "Content-Type": "audio/mpeg",
        "Access-Control-Allow-Origin": "*",
      };

      res.writeHead(206, headers);
      const stream = fs.createReadStream(audioPath, { start, end });
      stream.pipe(res);
    } catch (error) {
      this.sendError(res, error, 404);
    }
  }
}
