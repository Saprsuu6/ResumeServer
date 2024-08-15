import open from 'open';

import app from '../app';
import { CoinInfo } from '../interfaces/interfaces';
import swaggerDocs from '../swagger/swagger';

export const neededBitcoinNameArray = [
  'Bitcoin',
  'Ethereum',
  'BNB',
  'XRP',
  'Solana',
  'Cardano',
  'Avalanche',
  'Dogecoin',
  'TRON',
  'Polkadot',
  'Chainlink',
  'Polygon',
  'Toncoin',
  'Shiba Inu',
  'Litecoin',
  'Bitcoin Cash',
  'Cosmos Hub',
  'Uniswap',
  'Stellar',
  'OKB',
  'Monero',
  'Ethereum Classic'
];

export const neededCoins: Array<CoinInfo> = [];

const PORT = 8080;
const BASE_URL = `http://localhost:${PORT}`;

app.listen(PORT, async () => {
  console.log(`Server is running at ${BASE_URL}`);
  await open(`http://localhost:${PORT}`);
  swaggerDocs(app, BASE_URL);
});
