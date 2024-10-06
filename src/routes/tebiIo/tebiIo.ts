import express, { Request, Response } from 'express';
import { createReadStream } from 'fs';
import fs from 'fs/promises';
import { finished } from 'stream/promises';
import { v4 as uuidv4 } from 'uuid';

import { MulterFile } from '../../interfaces/interfaces.ts';
import { authenticateToken } from '../../middlewares/middlewares.ts';
import { deleteFile, uploadFile } from '../../services/tebi.ts';
import { upload } from '../routes.ts';

const tebiIoRouter = express.Router();

tebiIoRouter.route('/uploadMediaToTebiIo').post(
  // Используем upload.fields для обработки как файлов, так и полей формы
  upload.fields([
    { name: 'image', maxCount: 10 } // Обрабатываем до 10 файлов
  ]),
  authenticateToken,
  async (req: Request, res: Response): Promise<void> => {
    // Приводим тип req.files к интерфейсу MulterFile
    const files = req.files as MulterFile;

    // Проверяем, загружены ли файлы в поле 'image'
    if (!files || !files['image'] || files['image'].length === 0) {
      res.status(400).send({ message: 'Необходимо загрузить хотя бы один файл' });
      return;
    }

    const uploadedFilesUris: string[] = [];

    try {
      // Обрабатываем каждый файл
      for (const file of files['image']) {
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
      console.log(err);
      res.status(500).send({ message: err });
    }
  }
);

tebiIoRouter
  .route('/deleteMediaFromTebiIo/:id')
  .delete(authenticateToken, async (req: Request, res: Response): Promise<void> => {
    const fileId = req.query.id;

    try {
      await deleteFile(fileId as string);

      res.status(200).send({ message: `File with ID ${fileId} deleted successfully` });
    } catch (err) {
      console.error(`Error deleting file with ID ${fileId}:`, err);
      res.status(500).send({ message: `Failed to delete file with ID ${fileId}` });
    }
  });

export default tebiIoRouter;
