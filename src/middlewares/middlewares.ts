import { NextFunction, Request, Response } from 'express';
import { check, validationResult } from 'express-validator';
import jwt from 'jsonwebtoken';

import { Db } from 'mongodb';
import { neededCoins } from '../controllers/index.ts';
import { coinsList } from '../services/cryptoService.ts';
import { getUserByUsername } from '../services/database/auth.ts';
import { connectToMongo } from '../services/database/mongo_config.ts';

export const log = (req: Request, _: Response, next: NextFunction) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
};

export const customCors = (req: Request, res: Response, next: NextFunction) => {
  const allowedOrigins = ['http://localhost:5173', 'https://resumeclient-production.up.railway.app']; // Замените на ваш фронтенд-домен
  const origin = req.headers.origin as string;

  if (allowedOrigins.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin); // Указываем конкретный origin, а не '*'
  }

  // Разрешаем передачу куки с запросами
  res.header('Access-Control-Allow-Credentials', 'true');

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

export const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
  const accessToken: string = req.cookies?.accessToken;

  if (!accessToken) {
    res.sendStatus(401); // Access token отсутствует
    return;
  }

  jwt.verify(accessToken, process.env.SECRET_ACCESS as string, (err) => {
    if (err && err.name === 'TokenExpiredError') {
      const refreshToken: string = req.cookies?.refreshToken;

      if (!refreshToken) {
        res.sendStatus(401); // Refresh token отсутствует
        return;
      }

      jwt.verify(refreshToken, process.env.SECRET_REFRESH as string, (refreshErr, decodedUser) => {
        if (refreshErr) {
          // Refresh токен истек или недействителен
          res.clearCookie('refreshToken');
          res.clearCookie('accessToken');
          res.status(403).json({ message: 'Refresh token истек. Пожалуйста, войдите заново.' });
          return;
        }

        // Refresh токен действителен, создаем новый access токен
        const newAccessToken = jwt.sign(
          { username: (decodedUser as any).username },
          process.env.SECRET_ACCESS as string,
          { expiresIn: '15m' }
        );

        // Обновляем access token в cookie
        res.cookie('accessToken', newAccessToken, {
          httpOnly: true,
          secure: process.env.RAILWAY_ENVIRONMENT_NAME === 'production',
          sameSite: 'lax',
          maxAge: 15 * 60 * 1000 // 15 минут
        });

        next(); // Продолжаем обработку запроса
      });
    } else if (err) {
      res.sendStatus(403); // Access token недействителен
      return;
    } else {
      next(); // Access token действителен
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
  const existingUser = await connectToMongo(async (dbConnection: Db, username: string) => {
    await getUserByUsername(dbConnection, username);
  }, username);
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
