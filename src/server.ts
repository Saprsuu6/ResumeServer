import express from "express";
import bodyParser from "body-parser";
import router from "./routes.js";
import { cors, log } from "./middlewares.js";
import { CoinInfo } from "./interfaces.js";
import path from "path";
import serverless from "serverless-http";

export const neededBitcoinNameArray = [
  "Bitcoin",
  "Ethereum",
  "BNB",
  "XRP",
  "Solana",
  "Cardano",
  "Avalanche",
  "Dogecoin",
  "TRON",
  "Polkadot",
  "Chainlink",
  "Polygon",
  "Toncoin",
  "Shiba Inu",
  "Litecoin",
  "Bitcoin Cash",
  "Cosmos Hub",
  "Uniswap",
  "Stellar",
  "OKB",
  "Monero",
  "Ethereum Classic",
];

export const neededCoins: Array<CoinInfo> = [];

class Server {
  private app = express();
  private port = 8080;
  private baseUrl = `http://localhost:${this.port}`;
  private __dirname = path.resolve();

  constructor() {
    this.app.use(bodyParser.urlencoded({ extended: true }));
    this.app.use(bodyParser.json());
  }

  run(): void {
    this.app.use(bodyParser.json());
    this.app.use(bodyParser.urlencoded({ extended: true }));
    this.app.use(express.static(path.resolve(this.__dirname, "public")));
    this.app.use(cors);
    this.app.use(log);
    this.app.use("/api/", router);

    this.app.listen(this.port, async () => {
      console.log(this.baseUrl);
    });
  }

  getApi() {
    return this.app;
  }
}

const server = new Server();
server.run();
export const handler = serverless(server.getApi());
