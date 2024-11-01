import dotenv from 'dotenv';
import open from 'open';

import app from '../app.ts';
import { CoinInfo } from '../interfaces/interfaces.ts';
import swaggerDocs from '../swagger/swagger.ts';

dotenv.config();

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

const PORT = parseInt(process.env.PORT as string);
const BASE_URL = process.env.BASE_URL as string;

const serverInstance = app.listen(PORT, async () => {
  console.log(`Server is running at ${BASE_URL}`);
  await open(`http://localhost:${PORT}`);
  swaggerDocs(app, BASE_URL);
});

// Обработчик корректного завершения процесса
const shutdown = () => {
  console.log('Shutting down server...');
  serverInstance.close(() => {
    console.log('Server closed.');
    process.exit(0); // Завершаем процесс
  });

  // Если сервер не закроется за 10 секунд — принудительное завершение
  setTimeout(() => {
    console.error('Server did not close in time, forcefully shutting down.');
    process.exit(1); // Завершаем с ошибкой
  }, 10000);
};

// Обработка системных сигналов для завершения сервера
process.on('SIGINT', shutdown); // Нажатие Ctrl+C
process.on('SIGTERM', shutdown); // Сигнал завершения системы
