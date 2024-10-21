import http from 'http';
import { Db } from 'mongodb';
import { Server } from 'socket.io';
import app from '../app.ts';
import { IChatMessage } from '../interfaces/interfaces.ts';
import { postMessagesToChat } from './database/chat_messages.ts';
import { connectToMongo } from './database/mongo_config.ts';

// Создаем HTTP-сервер
const server = http.createServer(app);

// Инициализация Socket.IO отдельно от HTTP-сервера
const io = new Server(server, {
  cors: {
    origin: ['http://localhost:5173', 'https://resumeclient-production.up.railway.app'],
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// Реализация чата с использованием Socket.IO
io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);

  // Получение сообщения от клиента или администратора
  socket.on('sendMessage', async (data) => {
    const { sender, content } = data;

    const message = {
      sender,
      content,
      timestamp: new Date()
    };

    // Сохранение сообщения в базе данных
    try {
      await connectToMongo(
        async (dbConnection: Db, props: IChatMessage) => {
          await postMessagesToChat(dbConnection, props);
        },
        {
          sender: sender,
          content: content
        }
      );

      // Отправка сообщения всем подключенным пользователям
      io.emit('receiveMessage', message);
    } catch (err) {
      console.error('Error saving message:', err);
    }
  });

  // Отключение клиента
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});
