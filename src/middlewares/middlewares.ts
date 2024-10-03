import { NextFunction, Request, Response } from 'express';
import { check, validationResult } from 'express-validator';
import jwt from 'jsonwebtoken';

import { neededCoins } from '../controllers/index.ts';
import { coinsList } from '../services/cryptoService.ts';
import { getUserByUsername } from '../services/mongoDb.ts';

export const log = (req: Request, _: Response, next: NextFunction) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
};

export const cors = (req: Request, res: Response, next: NextFunction) => {
  // Разрешаем доступ со всех доменов
  res.header('Access-Control-Allow-Origin', '*');

  // Разрешаем указанные заголовки
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');

  // Разрешаем указанные методы
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');

  // Если это метод OPTIONS, завершаем запрос
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
    return;
  }

  next();
};

export const setResCoins = async (req: Request, _: Response, next: NextFunction) => {
  if (neededCoins.length <= 0) {
    const response = await coinsList();
    req.body = response;
  }
  next();
};

export const validateOwnerPassword = (req: Request, res: Response, next: NextFunction) => {
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
};

export const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    res.sendStatus(401);
    return;
  }

  jwt.verify(token, process.env.SECRET_ACCESS as string, (err, user) => {
    if (err && err.name === 'TokenExpiredError') {
      // Токен истек, пытаемся обновить
      const refreshToken = req.headers['x-refresh-token']; // Refresh token можно передавать в отдельном заголовке
      if (!refreshToken) {
        res.sendStatus(401); // Refresh token отсутствует
        return;
      }

      // Проверяем refresh token
      jwt.verify(refreshToken as string, process.env.SECRET_REFRESH as string, (refreshErr, decodedUser) => {
        if (refreshErr) {
          res.sendStatus(403); // Недействительный refresh token
          return;
        }

        // Генерируем новый access token
        const newAccessToken = jwt.sign(
          { username: (decodedUser as any).username },
          process.env.SECRET_ACCESS as string,
          { expiresIn: '15m' }
        );

        // Отправляем новый access token в заголовке или теле ответа
        res.setHeader('x-access-token', newAccessToken);

        // После обновления токена, продолжаем обработку запроса
        next();
      });
    } else if (err) {
      return res.sendStatus(403); // Другие ошибки (не истекший токен, но недействительный)
    } else {
      // Токен действителен, продолжаем обработку запроса
      next();
    }
  });
};

export const validateCredentials = (req: Request, res: Response, next: NextFunction) => {
  const { username, password } = req.body;

  // Проверка логина
  if (!username || username.length < 3 || /\s/.test(username)) {
    res.status(400).json({ message: 'Логин должен быть не менее 3 символов и не содержать пробелов.' });
    return;
  }

  // Проверка пароля
  const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/;
  if (!password || !passwordRegex.test(password)) {
    res.status(400).json({
      message:
        'Пароль должен быть не менее 8 символов, содержать хотя бы одну заглавную букву, одну цифру и один специальный символ.'
    });
    return;
  }

  next(); // Если все проверки пройдены, передаем управление следующему middleware
};

export const checkUniqueUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const { username } = req.body;

  // Проверка, существует ли пользователь с таким именем
  const existingUser = await getUserByUsername(username);
  if (existingUser) {
    res.status(400).json({ message: 'Имя пользователя уже занято' });
    return;
  }

  next();
};

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
export const handleValidationErrors = (req: Request, res: Response, next: NextFunction): void | Promise<void> => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
    return;
  }
  next();
};
