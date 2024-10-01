import { NextFunction, Request, Response } from 'express';
import { check, validationResult } from 'express-validator';

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

export const validatePoster = [
  check('imageUrl').isURL().withMessage('Поле imageUrl должно быть валидным URL'),
  check('eventName').isLength({ min: 1 }).withMessage('Поле eventName обязательно'),
  check('description').isLength({ min: 1 }).withMessage('Поле description обязательно'),
  check('date').isISO8601().toDate().withMessage('Поле date должно быть валидной датой'),
  check('location').isLength({ min: 1 }).withMessage('Поле location обязательно'),
  check('artists').isArray().withMessage('Поле artists должно быть массивом'),
  check('ticketPrice').isFloat({ min: 0 }).withMessage('Поле ticketPrice должно быть числом больше или равно 0'),
  check('availableTickets')
    .isInt({ min: 0 })
    .withMessage('Поле availableTickets должно быть целым числом больше или равно 0'),
  check('eventType').isLength({ min: 1 }).withMessage('Поле eventType обязательно'),
  check('organizer').isLength({ min: 1 }).withMessage('Поле organizer обязательно')
];

// использовать вместе с концкертным валидатором
export const handleValidationErrors = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};
