import express, { Application } from "express";
import cors from "cors";
import { SongRoutes } from "./routes/songsRoute";
import logger from "pino";
import cron from "node-cron";

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
  }

  private initializeRoutes() {
    this.app.use("/api", new SongRoutes().getRouter());
  }

  public listen() {
    this.app.listen(this.port, () => {
      console.log(`Server running on port ${this.port}`);
    });
  }
}

export default App;
