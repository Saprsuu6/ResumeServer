import { coinsList } from "./cryptoService.js";
import { neededCoins } from "./netlify/functions/api.js";
export function log(req, res, next) {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
}
export function cors(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
}
export async function setResCoins(req, res, next) {
    if (neededCoins.length <= 0) {
        const response = await coinsList();
        req.body = response;
    }
    next();
}
//# sourceMappingURL=middlewares.js.map