import { AbstractService } from "./abstractService";
import fs from "fs";
import path from "path";
import * as mm from "music-metadata";
import { CompleteUploadInput, SaveChunkInput, SaveChunkResult } from "../types";

export class SongService extends AbstractService {
  private readonly maxFileSize = 30 * 1024 * 1024;
  private readonly chunksRoot = path.join(process.cwd(), "src/storage/chunks");
  private readonly finalRoot = path.join(process.cwd(), "src/storage");

  private sanitizeFileName(fileName: string): string {
    return path.basename(fileName).replace(/[^a-zA-Z0-9._-]/g, "_");
  }

  private normalizeUploadId(uploadId: string): string {
    return uploadId.replace(/[^a-zA-Z0-9_-]/g, "");
  }

  private toPublicPath(storedName: string): string {
    return `/src/storage/${storedName}`;
  }

  public getAllSongs() {
    return this.prismaClient.song.findMany({
      orderBy: { id: "desc" },
    });
  }

  public async getSongById(id: number) {
    const song = await this.prismaClient.song.findUnique({ where: { id } });
    if (!song) throw new Error("Song not found");
    return song;
  }

  private async allChunksExist(
    uploadDir: string,
    totalChunks: number,
  ): Promise<boolean> {
    for (let index = 0; index < totalChunks; index += 1) {
      const partPath = path.join(uploadDir, `${index}.part`);
      try {
        await fs.promises.access(partPath);
      } catch {
        return false;
      }
    }
    return true;
  }

  private async assembleFile(params: {
    uploadDir: string;
    fileName: string;
    totalChunks: number;
    totalSize: number;
  }) {
    const storedName = `${params.fileName}`;
    const finalPath = path.join(this.finalRoot, storedName);

    await fs.promises.mkdir(this.finalRoot, { recursive: true });
    await fs.promises.writeFile(finalPath, Buffer.alloc(0));

    for (let index = 0; index < params.totalChunks; index += 1) {
      const partPath = path.join(params.uploadDir, `${index}.part`);
      const chunkBuffer = await fs.promises.readFile(partPath);
      await fs.promises.appendFile(finalPath, chunkBuffer);
    }

    const stat = await fs.promises.stat(finalPath);

    if (stat.size !== params.totalSize) {
      await fs.promises.rm(finalPath, { force: true });
      throw new Error("Final file size mismatch");
    }

    return {
      fileName: storedName,
      path: this.toPublicPath(storedName),
      absolutePath: finalPath,
      size: stat.size,
    };
  }

  public async saveChunk(input: SaveChunkInput): Promise<SaveChunkResult> {
    const uploadId = this.normalizeUploadId(input.uploadId);

    if (!uploadId) {
      throw new Error("Invalid uploadId");
    }

    if (!Number.isInteger(input.chunkIndex) || input.chunkIndex < 0) {
      throw new Error("Invalid chunkIndex");
    }

    if (!Number.isInteger(input.totalChunks) || input.totalChunks <= 0) {
      throw new Error("Invalid totalChunks");
    }

    if (input.chunkIndex >= input.totalChunks) {
      throw new Error("chunkIndex is out of range");
    }

    if (!Number.isInteger(input.totalSize) || input.totalSize <= 0) {
      throw new Error("Invalid totalSize");
    }

    if (input.totalSize > this.maxFileSize) {
      throw new Error("File too large. Max allowed is 30MB.");
    }

    if (!Buffer.isBuffer(input.chunk) || input.chunk.length === 0) {
      throw new Error("Chunk is empty");
    }

    const safeFileName = this.sanitizeFileName(input.fileName || "file.bin");
    const uploadDir = path.join(this.chunksRoot, uploadId);

    await fs.promises.mkdir(uploadDir, { recursive: true });

    const metaPath = path.join(uploadDir, "meta.json");
    await fs.promises.writeFile(
      metaPath,
      JSON.stringify(
        {
          fileName: safeFileName,
          totalChunks: input.totalChunks,
          totalSize: input.totalSize,
        },
        null,
        2,
      ),
    );

    const chunkPath = path.join(uploadDir, `${input.chunkIndex}.part`);
    await fs.promises.writeFile(chunkPath, input.chunk);

    const hasAllChunks = await this.allChunksExist(
      uploadDir,
      input.totalChunks,
    );

    if (!hasAllChunks) {
      return {
        status: "partial",
        uploadId,
        chunkIndex: input.chunkIndex,
        totalChunks: input.totalChunks,
      };
    }

    const assembled = await this.assembleFile({
      uploadDir,
      fileName: safeFileName,
      totalChunks: input.totalChunks,
      totalSize: input.totalSize,
    });

    await fs.promises.rm(uploadDir, { recursive: true, force: true });

    return {
      status: "completed",
      uploadId,
      fileName: assembled.fileName,
      path: assembled.path,
      absolutePath: assembled.absolutePath,
      size: assembled.size,
    };
  }

  public async completeUpload(input: CompleteUploadInput) {
    const fileName = this.sanitizeFileName(String(input.fileName || ""));
    const publicPath = String(input.path || "");

    if (!fileName) {
      throw new Error("Invalid fileName");
    }

    if (!publicPath) {
      throw new Error("Invalid path");
    }

    const normalizedPath = publicPath.replace(/^\/+/, "");
    const absolutePath = path.join(process.cwd(), normalizedPath);

    try {
      await fs.promises.access(absolutePath);
    } catch {
      throw new Error("File not found in storage");
    }

    let duration: number | null = null;
    try {
      const metadata = await mm.parseFile(absolutePath);
      duration = metadata.format.duration
        ? Math.round(metadata.format.duration)
        : null;
    } catch {
      // durata ramane null daca fisierul nu poate fi citit
    }

    const song = await this.prismaClient.song.create({
      data: {
        name: fileName,
        path: publicPath,
        duration,
      },
    });

    return {
      id: song.id,
      name: song.name,
      path: song.path,
      duration: song.duration,
    };
  }
}
