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

export default generalRouter;
