import { neededBitcoinNameArray, neededCoins } from "./index.js";
import { coinsInfo } from "./cryptoService.js";
export default async (request, context) => {
    if (neededCoins.length <= 0) {
        let array = undefined;
        try {
            array = await coinsInfo();
        }
        catch (error) {
            return {
                message: "We are sorry, something went wrong",
            };
            return;
        }
        const allNeededCoins = array.filter((coin) => neededBitcoinNameArray.includes(coin.name));
        const newArrayWithConcreteFields = allNeededCoins.map((coin) => ({
            name: coin.name,
            usd: coin.current_price,
            usd_24h_change: coin.price_change_percentage_1h_in_currency,
        }));
        neededCoins.push(...newArrayWithConcreteFields);
        setInterval(() => {
            neededCoins.length = 0;
        }, 1 * 60 * 1000);
    }
    return neededCoins;
};
export const config = {
    path: "/test",
};
//# sourceMappingURL=getCryptos.js.map