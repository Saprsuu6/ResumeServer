import bodyParser from 'body-parser';
import express, { Express } from 'express';
import path from 'path';

import { cors, log } from './middlewares/middlewares.ts';
import router from './routes/routes.ts';

export class App {
  public app: Express;
  private __dirname = path.resolve();

  constructor() {
    this.app = express();
    this.configureMiddleware();
    this.configureRoutes();
  }

  private configureMiddleware(): void {
    this.app.use(bodyParser.json());
    this.app.use(bodyParser.urlencoded({ extended: true }));
    this.app.use(express.static(path.resolve(this.__dirname, 'public')));
    this.app.use(cors);
    this.app.use(log);
  }

  private configureRoutes(): void {
    this.app.use(router);
  }
}

export default new App().app;
