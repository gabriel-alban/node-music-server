import express, { Application } from "express";
import { Request, Response } from "express";
import cors from "cors";
import { SongRoutes } from "./routes/songsRoute";
import logger from "pino";
import cron from "node-cron";
import path from "path";
import { AuthRoutes } from "./routes/authRoute";

class App {
  public app: Application;
  public port: number;

  constructor(port: number) {
    this.app = express();
    this.port = port;
    this.initializeMiddlewares();
    this.initializeRoutes();
  }

  private initializeMiddlewares() {
    this.app.use(express.json());
    this.app.use(cors());
    this.app.use(express.urlencoded({ extended: false }));
    this.app.use(express.static(path.join(__dirname, "../")));
  }

  private initializeRoutes() {
    this.app.use("/api", new SongRoutes().getRouter());
    this.app.use("/api", new AuthRoutes().getRouter());
    this.app.get("/", (_req: Request, res: Response) => {
      res.sendFile(path.join(__dirname, "../test.html"));
    });
  }

  public listen() {
    this.app.listen(this.port, () => {
      console.log(`Server running on port ${this.port}`);
    });
  }
}

export default App;
