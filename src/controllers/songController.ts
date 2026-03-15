import { Response, Request } from "express";
import { BaseController } from "./abstract/baseController";
import fs from "fs";
import path from "path";

export class SongController extends BaseController {
  public async getSongs(req: Request, res: Response): Promise<void> {
    const audioPath = path.join(__dirname + "../../storage/", "old_friend.mp3");
    const stat = fs.statSync(audioPath);
    const fileSize = stat.size;

    const range = req.headers.range;

    if (!range) {
      res.status(400).send("Require range");
      return;
    }

    const CHUNK_SIZE = 10 ** 6;

    const start = Number(range.replace(/\D/g, ""));
    const end = Math.min(start + CHUNK_SIZE, fileSize - 1);

    const contentLength = end - start + 1;
    const headers = {
      "Content-Range": `bytes ${start}-${end}/${fileSize}`,
      "Accept-Range": "bytes",
      "Content-Length": contentLength,
      "Content-Type": "audio/mpeg",
    };

    res.writeHead(206, headers);
    const stream = fs.createReadStream(audioPath, { start, end });
    stream.pipe(res);
  }
}
