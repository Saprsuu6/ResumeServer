import express from "express";
import bodyParser from "body-parser";
import router from "./routes.js";
import log from "./log.js";

class Server {
  private app = express();
  private port = 8080;

  constructor() {
    this.app.use(bodyParser.urlencoded({ extended: true }));
    this.app.use(bodyParser.json());
  }

  run(): void {
    this.app.use(bodyParser.json());
    this.app.use(bodyParser.urlencoded({ extended: true }));
    this.app.use(express.static("public"));
    this.app.use(log);
    this.app.use(router);

    this.app.listen(this.port, async () => {
      console.log(`http://localhost:${this.port}`);
    });
  }
}

const server = new Server();
server.run();
