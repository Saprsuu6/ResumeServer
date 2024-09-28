import { NextFunction, Request, Response } from 'express';

import { neededCoins } from '../controllers/index.ts';
import { coinsList } from '../services/cryptoService.ts';

export function log(req: Request, res: Response, next: NextFunction): void {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
}

export function cors(req: Request, res: Response, next: NextFunction): void {
  res.header('Access-Control-Allow-Origin', '*'); // Разрешить доступ со всех доменов
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
}

export async function setResCoins(req: Request, res: Response, next: NextFunction): Promise<void> {
  if (neededCoins.length <= 0) {
    const response = await coinsList();
    req.body = response;
  }
  next();
}

export async function validateOwnerPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
  const { OWNER_PASSWORD } = req.body;

  // Проверка обязательных параметров
  if (!OWNER_PASSWORD) {
    res.status(400).send({ message: 'Missing required parameter (OWNER_PASSWORD)' });
    return;
  }

  if (OWNER_PASSWORD !== process.env.OWNER_PASSWORD) {
    res.status(403).send({ message: 'Invalid password' });
    return;
  }

  next();
}
