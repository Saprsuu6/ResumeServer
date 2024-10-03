import express, { Request, Response } from 'express';
import { createReadStream } from 'fs';
import fs from 'fs/promises';
import { finished } from 'stream/promises';
import { v4 as uuidv4 } from 'uuid';

import { authenticateToken, validateOwnerPassword } from '../../middlewares/middlewares.ts';
import { uploadFile } from '../../services/tebi.ts';
import { upload } from '../routes.ts';

const tebiIoRouter = express.Router();

tebiIoRouter.route('/uploadImgToTebiIo').post(
  // Используем upload.fields для обработки как файлов, так и полей формы
  upload.fields([
    { name: 'image', maxCount: 10 }, // Обрабатываем до 10 файлов
    { name: 'OWNER_PASSWORD', maxCount: 1 } // Поле для пароля
  ]),
  authenticateToken,
  validateOwnerPassword, // Проверяем наличие и правильность пароля
  async (req: Request, res: Response): Promise<void> => {
    // Проверяем, загружены ли файлы
    if (!req.files || (req.files as Express.Multer.File[]).length === 0) {
      res.status(400).send({ message: 'Need at least one file' });
      return;
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
          res.status(400).send({ message: 'Internal error' });
          return;
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
      res.status(500).send({ message: err });
    }
  }
);

export default tebiIoRouter;
