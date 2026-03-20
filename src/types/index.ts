export interface User {
  name: string;
  email: string;
  password: string;
}

export type SaveChunkInput = {
  uploadId: string;
  fileName: string;
  chunkIndex: number;
  totalChunks: number;
  totalSize: number;
  chunk: Buffer;
};

export type SaveChunkResult =
  | {
      status: "partial";
      uploadId: string;
      chunkIndex: number;
      totalChunks: number;
    }
  | {
      status: "completed";
      uploadId: string;
      fileName: string;
      path: string;
      absolutePath: string;
      size: number;
    };

export type CompleteUploadInput = {
  fileName: string;
  path: string;
};

export type UploadedChunk = {
  buffer: Buffer;
  originalname: string;
  size: number;
  mimetype: string;
};
