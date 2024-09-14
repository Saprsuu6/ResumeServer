import express from 'express';
import { createReadStream, existsSync, mkdirSync } from 'fs';
import fs from 'fs/promises';
import multer from 'multer';
import path from 'path';
import { finished } from 'stream/promises';
import { fileURLToPath } from 'url';
import { v4 as uuidv4 } from 'uuid';

import { neededBitcoinNameArray, neededCoins } from '../controllers/index.ts';
import { CoinInfo, PingResponse } from '../interfaces/interfaces.ts';
import { coinsInfo, ping } from '../services/cryptoService.ts';
import { uploadFile } from '../services/tebi.ts';

const router = express.Router();

// Создаем эквивалент __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const uploadDir = path.join(__dirname, 'uploads');
if (!existsSync(uploadDir)) {
  mkdirSync(uploadDir);
}
export const upload = multer({ dest: uploadDir });

router.route('/').get(async (req, res) => {
  res.sendFile(path.resolve(__dirname, 'public', 'index.html'));
});

router.route('/cryptoPing').get(async (req, res) => {
  const response: Promise<PingResponse> = ping();

  // to send only string
  // res.send((await response).gecko_says);

  response.then((data) => {
    res.send(data);
  });
});

router.route('/getCryptoInfo').get(async (req, res) => {
  if (neededCoins.length <= 0) {
    let array: any = undefined;

    try {
      array = await coinsInfo();
    } catch (error) {
      res.status(500).send({
        message: 'We are sorry, something went wrong'
      });
      return;
    }

    const allNeededCoins = array.filter((coin: any) => neededBitcoinNameArray.includes(coin.name));

    const newArrayWithConcreteFields: CoinInfo[] = allNeededCoins.map((coin: any) => ({
      name: coin.name,
      usd: coin.current_price,
      usd_24h_change: coin.price_change_percentage_1h_in_currency
    }));

    neededCoins.push(...newArrayWithConcreteFields);
    setInterval(() => {
      neededCoins.length = 0;
    }, 1 * 60 * 1000);
  }

  res.send(neededCoins);
});

router.route('/uploadImgToTebiIo').post(upload.array('image'), async (req, res) => {
  // Проверяем, загружены ли файлы
  if (!req.files || (req.files as Express.Multer.File[]).length === 0) {
    return res.status(400).send({ message: 'Need at least one file' });
  }

  const files = req.files as Express.Multer.File[]; // Приводим к правильному типу
  const uploadedFilesUris: string[] = [];

  try {
    // Обрабатываем каждый файл
    for (const file of files) {
      const fileStream = createReadStream(file.path);
      const uniqueFileName = `${uuidv4()}_${file.originalname}`;

      try {
        // Загружаем файл на Tebi и сохраняем ссылку
        const uri = await uploadFile(uniqueFileName, fileStream, file);
        uploadedFilesUris.push(uri);

        // Ожидаем завершения потока перед удалением файла
        await finished(fileStream);
      } catch (err) {
        console.error(`Error uploading file ${file.originalname}:`, err);
        return res.status(400).send({ message: 'Internal error' });
      } finally {
        try {
          // Удаляем временный файл после загрузки
          await fs.unlink(file.path); // Асинхронное удаление
        } catch (unlinkError) {
          console.error(`Error deleting file ${file.path}:`, unlinkError);
        }
      }
    }

    // Возвращаем ссылки на все загруженные файлы
    res.send({ uris: uploadedFilesUris });
  } catch (err) {
    return res.status(500).send({ message: err });
  }
});

export default router;
