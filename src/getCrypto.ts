import { Handler } from "@netlify/functions";
import { neededBitcoinNameArray, neededCoins } from "./server.js";
import { coinsInfo } from "./cryptoService.js";

const handler: Handler = async (event, context) => {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE",
  };

  if (neededCoins.length <= 0) {
    let array: any = undefined;

    try {
      array = await coinsInfo();
    } catch (error) {
      return {
        statusCode: 500,
        body: JSON.stringify({ message: "We are sorry, something went wrong" }),
      };
    }

    const allNeededCoins = array.filter((coin: any) =>
      neededBitcoinNameArray.includes(coin.name)
    );

    const newArrayWithConcreteFields = allNeededCoins.map((coin: any) => ({
      name: coin.name,
      usd: coin.current_price,
      usd_24h_change: coin.price_change_percentage_1h_in_currency,
    }));

    neededCoins.push(...newArrayWithConcreteFields);
    setInterval(() => {
      neededCoins.length = 0;
    }, 1 * 60 * 1000);
  }

  return {
    statusCode: 200,
    headers,
    body: JSON.stringify(neededCoins),
  };
};

export { handler };
