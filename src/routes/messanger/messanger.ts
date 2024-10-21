import express from 'express';
import { Db } from 'mongodb';

import { getMessagesFromChat } from '../../services/database/chat_messages.ts';
import { connectToMongo } from '../../services/database/mongo_config.ts';

const messangerRouter = express.Router();

messangerRouter.get('/messages', async (req, res) => {
  try {
    const messages = await connectToMongo(async (dbConnection: Db) => {
      await getMessagesFromChat(dbConnection);
    });

    res.status(200).json({ message: messages });
  } catch (err) {
    res.status(500).send(err);
  }
});

export default messangerRouter;
