import bodyParser from 'body-parser';
import express, { Express } from 'express';
import path from 'path';

import { cors, log } from './middlewares/middlewares.ts';
import authRouter from './routes/auth/auth.ts';
import cryptosRouter from './routes/cryptos/cryptos.ts';
import postersRouter from './routes/posters/posters.ts';
import generalRouter from './routes/routes.ts';
import tebiIoRouter from './routes/tebiIo/tebiIo.ts';

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
    this.app.use(generalRouter);
    this.app.use(cryptosRouter);
    this.app.use(authRouter);
    this.app.use(postersRouter);
    this.app.use(tebiIoRouter);
  }
}

export default new App().app;
