import * as dotenv from 'dotenv';
import { Db, MongoClient } from 'mongodb';

dotenv.config();

const uri = process.env.MONGO_DB_CONNECTION_STRING as string;
const dbName = process.env.MONGO_DB_NAME;

export async function connectToMongo(
  callback: (dbConnection: Db, ...args: any[]) => Promise<any>,
  ...args: any[]
): Promise<any> {
  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log('Успешное подключение к MongoDB (ленивая загрузка)');

    const dbConnection = client.db(dbName);

    // Возвращаем результат выполнения callback
    return await callback(dbConnection, ...args);
  } catch (error) {
    console.error('Ошибка подключения к MongoDB:', error);
  } finally {
    await client.close();
  }
}
