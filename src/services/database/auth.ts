import { Db } from 'mongodb';
import { IClient } from '../../interfaces/interfaces.ts';

export async function addNewClient(db: Db, props: IClient) {
  try {
    const collection = db.collection(process.env.CLIENTS_COLLECTION as string);

    const newClient: IClient = {
      username: props.username,
      password: props.password
    };

    const result = await collection.insertOne(newClient);
    console.log(`Добавлен новый клиент с id: ${result.insertedId}`);
  } catch (err) {
    console.error('Ошибка при работе с базой данных:', err);
  }
}

export async function getUserByUsername(db: Db, username: string) {
  try {
    const collection = db.collection(process.env.CLIENTS_COLLECTION as string);

    const user = await collection.findOne({ username });
    return user;
  } catch (err) {
    console.error('Ошибка при работе с базой данных:', err);
    return null;
  }
}
