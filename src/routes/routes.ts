import express, { Request, Response } from 'express';
import { createReadStream, existsSync, mkdirSync } from 'fs';
import fs from 'fs/promises';
import multer from 'multer';
import path from 'path';
import { finished } from 'stream/promises';
import { fileURLToPath } from 'url';
import { v4 as uuidv4 } from 'uuid';

import { neededBitcoinNameArray, neededCoins } from '../controllers/index.ts';
import { CoinInfo, IConcertPoster, PingResponse } from '../interfaces/interfaces.ts';
import { coinsInfo, ping } from '../services/cryptoService.ts';
import { addPoster, deletePoster, getPosterById, getPosters, updatePoster } from '../services/mongoDb.ts';
import { uploadFile } from '../services/tebi.ts';
import { handleValidationErrors, validateOwnerPassword, validatePoster } from './../middlewares/middlewares.ts';

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

router.route('/uploadImgToTebiIo').post(
  // Используем upload.fields для обработки как файлов, так и полей формы
  upload.fields([
    { name: 'image', maxCount: 10 }, // Обрабатываем до 10 файлов
    { name: 'OWNER_PASSWORD', maxCount: 1 } // Поле для пароля
  ]),
  validateOwnerPassword, // Проверяем наличие и правильность пароля
  async (req, res) => {
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
  }
);

router.route('/posters').post(validatePoster, handleValidationErrors, async (req: Request, res: Response) => {
  try {
    const poster: IConcertPoster = req.body;
    await addPoster(poster);
    res.status(201).json({ message: 'Постер успешно добавлен' });
  } catch (error) {
    res.status(500).json({ error: 'Ошибка при добавлении постера' });
  }
});

router.route('/posters').get(async (req, res) => {
  try {
    const posters = await getPosters();
    res.status(200).json(posters);
  } catch (error) {
    res.status(500).json({ error: 'Ошибка при получении постеров' });
  }
});

router.route('/posters/byId/:id').get(async (req, res) => {
  try {
    const { id } = req.params;
    const poster = await getPosterById(id);
    res.status(200).json(poster);
  } catch (error) {
    res.status(500).json({ error: 'Ошибка при получении постеров' });
  }
});

router.route('/posters/:id').delete(async (req, res) => {
  try {
    const { id } = req.params;
    await deletePoster(id);
    res.status(200).json({ message: `Постер с id ${id} успешно удалён` });
  } catch (error) {
    res.status(500).json({ error: 'Ошибка при удалении постера' });
  }
});

router.route('/posters/:id').put(validatePoster, handleValidationErrors, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updatedData: Partial<IConcertPoster> = req.body;
    await updatePoster(id, updatedData);
    res.status(200).json({ message: `Постер с id ${id} успешно обновлён` });
  } catch (error) {
    res.status(500).json({ error: 'Ошибка при обновлении постера' });
  }
});

export default router;
