import type { Config } from "@netlify/edge-functions";
import { neededBitcoinNameArray, neededCoins } from "./index.js";
import { coinsInfo } from "./cryptoService.js";
import { Context } from "@netlify/functions";
import { CoinInfo } from "./interfaces.js";

export default async (request: Request, context: Context)  {
  if (neededCoins.length <= 0) {
    let array: any = undefined;

    try {
      array = await coinsInfo();
    } catch (error) {
      return {
        message: "We are sorry, something went wrong",
      };
      return;
    }

    const allNeededCoins = array.filter((coin: any) => neededBitcoinNameArray.includes(coin.name));

    const newArrayWithConcreteFields: CoinInfo[] = allNeededCoins.map((coin: any) => ({
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

export const config: Config = {
  path: "/getCryptos",
};
