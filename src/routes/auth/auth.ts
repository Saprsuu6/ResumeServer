import bcrypt from 'bcryptjs';
import express from 'express';

import { checkUniqueUser, validateCredentials } from '../../middlewares/middlewares.ts';
import { generateAccessToken, generateRefreshToken } from '../../services/auth.ts';
import { addNewClient, getUserByUsername } from '../../services/mongoDb.ts';

const authRouter = express.Router();

authRouter.route('/register').post(checkUniqueUser, validateCredentials, async (req, res) => {
  try {
    const { username, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    addNewClient({
      username: username,
      password: hashedPassword
    });
    res.status(201).json({ message: 'Пользователь успешно зарегестрирован' });
  } catch (error) {
    res.status(500).json({ error: 'Ошибка при регистрации пользователя' });
  }
});

authRouter.route('/login').post(async (req, res) => {
  const { username, password } = req.body;
  const user = await getUserByUsername(username);
  if (!user || !(await bcrypt.compare(password, user.password))) {
    res.status(403).json({ message: 'Неправильные учетные данные' });
    return;
  }

  // Генерация токенов
  const accessToken = generateAccessToken(user.username);
  const refreshToken = generateRefreshToken(user.username);

  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: true, // Использовать только через HTTPS в продакшене
    sameSite: true, // Защита от CSRF
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 дней жизни для refresh token
  });

  res.cookie('accessToken', accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 15 * 60 * 1000 // Access token живет 15 минут
  });

  res.sendStatus(200);
});

export default authRouter;
