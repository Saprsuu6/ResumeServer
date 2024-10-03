import jwt from 'jsonwebtoken';

export const generateAccessToken = (username: string) => {
  return jwt.sign({ username }, process.env.SECRET_ACCESS as string, { expiresIn: '15m' }); // токен будет действовать 15 минут
};

export const generateRefreshToken = (username: string) => {
  return jwt.sign({ username }, process.env.SECRET_REFRESH as string, { expiresIn: '7d' }); // токен будет действовать 7 дней
};
