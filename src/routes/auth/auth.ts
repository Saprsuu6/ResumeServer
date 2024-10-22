import bcrypt from 'bcryptjs';
import express from 'express';

import { Db } from 'mongodb';
import { IClient } from '../../interfaces/interfaces.ts';
import { authenticateToken, checkUniqueUser, validateCredentials } from '../../middlewares/middlewares.ts';
import { generateAccessToken, generateRefreshToken } from '../../services/auth.ts';
import { addNewClient, getUserByUsername } from '../../services/database/auth.ts';
import { connectToMongo } from '../../services/database/mongo_config.ts';

const authRouter = express.Router();

authRouter.route('/register').post(checkUniqueUser, validateCredentials, async (req, res) => {
  try {
    const { username, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await connectToMongo(
      async (dbConnection: Db, props: IClient) => {
        return await addNewClient(dbConnection, props);
      },
      {
        username: username,
        password: hashedPassword
      }
    );
    res.status(201).json({ message: result });
  } catch (error) {
    res.status(500).json({ error: 'Ошибка при регистрации пользователя' });
  }
});

authRouter.route('/login').post(async (req, res) => {
  const { username, password } = req.body;
  const user = await connectToMongo(async (dbConnection: Db, username: string) => {
    return await getUserByUsername(dbConnection, username);
  }, username);
  if (!user || !(await bcrypt.compare(password, user.password))) {
    res.status(403).json({ message: 'Неправильные учетные данные' });
    return;
  }

  // Генерация токенов
  const accessToken = generateAccessToken(user.username);
  const refreshToken = generateRefreshToken(user.username);

  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: process.env.RAILWAY_ENVIRONMENT_NAME === 'production', // Использовать только через HTTPS в продакшене
    sameSite: 'lax', // Защита от CSRF
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 дней жизни для refresh token
  });

  res.cookie('accessToken', accessToken, {
    httpOnly: true,
    secure: process.env.RAILWAY_ENVIRONMENT_NAME === 'production',
    sameSite: 'lax',
    maxAge: 15 * 60 * 1000 // Access token живет 15 минут
  });

  res.sendStatus(200);
});

authRouter.route('/auth-status').get(authenticateToken, (req, res) => {
  res.status(200).json({ message: 'Пользователь авторизован' });
});

authRouter.route('/logout').post((_, res) => {
  // Удаляем refreshToken и accessToken из куков
  res.clearCookie('refreshToken', {
    httpOnly: true,
    secure: process.env.RAILWAY_ENVIRONMENT_NAME === 'production',
    sameSite: 'lax'
  });
  res.clearCookie('accessToken', {
    httpOnly: true,
    secure: process.env.RAILWAY_ENVIRONMENT_NAME === 'production',
    sameSite: 'lax'
  });

  // Отправляем ответ клиенту
  res.status(200).json({ message: 'Вы успешно вышли из системы' });
});

export default authRouter;
