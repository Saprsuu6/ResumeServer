import { Db } from 'mongodb';
import { IChatMessage } from '../../interfaces/interfaces.ts';

export async function getMessagesFromChat(db: Db) {
  try {
    const collection = db.collection(process.env.CHAT_MESSAGES_COLLECTION as string);

    const messagesCollection = await collection.find({}).toArray();
    return messagesCollection;
  } catch (err) {
    console.error('Error connecting to MongoDB:', err);
    throw err;
  }
}

export async function postMessagesToChat(db: Db, props: IChatMessage) {
  try {
    const collection = db.collection(process.env.CLIENTS_COLLECTION as string);

    const message = {
      sender: props.sender,
      content: props.content,
      timestamp: new Date()
    };

    const result = await collection.insertOne(message);
    console.log(`Добавлено новое сообщение id: ${result.insertedId}`);
  } catch (err) {
    console.error('Error connecting to MongoDB:', err);
    throw err;
  }
}
