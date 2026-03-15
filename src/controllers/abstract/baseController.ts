import { Response } from "express";

export abstract class BaseController {
  constructor() {}

  protected sendResponse<T>(
    res: Response,
    data: T,
    statusCode: number = 200,
  ): void {
    res.status(statusCode).json({ success: true, data });
  }

  protected sendError(
    res: Response,
    error: any,
    statusCode: number = 500,
  ): void {
    res
      .status(statusCode)
      .json({ success: false, error: error?.message || error });
  }
}
