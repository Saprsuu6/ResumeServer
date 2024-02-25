import express from "express";
import bodyParser from "body-parser";
import router from "./routes.js";
import { cors, log } from "./middlewares.js";
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
        this.baseUrlProd = "https://saprlandserver.netlify.app/public/index.html";
        this.app.use(bodyParser.urlencoded({ extended: true }));
        this.app.use(bodyParser.json());
    }
    run() {
        this.app.use(bodyParser.json());
        this.app.use(bodyParser.urlencoded({ extended: true }));
        this.app.use(express.static("public"));
        this.app.use(cors);
        this.app.use(log);
        this.app.use(router);
        this.app.listen(this.port, async () => {
            console.log(this.baseUrlProd);
        });
    }
}
const server = new Server();
server.run();
//# sourceMappingURL=server.js.map