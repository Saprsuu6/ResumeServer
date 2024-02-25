import express from "express";
import bodyParser from "body-parser";
import router from "./routes.js";
import { cors, log } from "./middlewares.js";
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
export const neededCoins = [];
class Server {
    constructor() {
        this.app = express();
        this.port = 8080;
        this.baseUrl = `http://localhost:${this.port}`;
        this.__dirname = path.resolve();
        this.app.use(bodyParser.urlencoded({ extended: true }));
        this.app.use(bodyParser.json());
    }
    run() {
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
export const handler = serverless(server.getApi());
//# sourceMappingURL=server.js.map