import express from 'express';
import { existsSync, mkdirSync } from 'fs';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';

const generalRouter = express.Router();

// Создаем эквивалент __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const uploadDir = path.join(__dirname, 'uploads');
if (!existsSync(uploadDir)) {
  mkdirSync(uploadDir);
}
export const upload = multer({ dest: uploadDir });

generalRouter.route('/').get(async (_, res) => {
  res.sendFile(path.resolve(__dirname, 'public', 'index.html'));
});

generalRouter.get('/api-docs/openapi.json', (req, res) => {
  // Убедитесь, что res является объектом Express
  if (typeof res.setHeader === 'function') {
    res.setHeader('Content-Type', 'application/json');
    res.sendFile(path.join(__dirname, '../swagger/swaggerDocument.json')); // Укажите правильный путь к файлу
  } else {
    console.error('res is not a valid Express response object');
  }
});

export default generalRouter;
