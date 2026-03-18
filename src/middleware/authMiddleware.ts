import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { User } from "../types";

export const authMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const header = req.headers.authorization;

  if (!header || !header.startsWith("Bearer ")) {
    return res.status(401).json({ success: false, error: "Unauthorized" });
  }

  const token = header.split(" ")[1];

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET!,
    ) as jwt.JwtPayload & { id?: number; user?: User };

    if (decoded && decoded.id) {
      (req as Request & { user?: User }).user = decoded?.user;
    }

    next();
  } catch (error) {
    return res.status(401).json({ success: false, error: "Invalid token" });
  }
};
