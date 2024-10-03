import * as dotenv from 'dotenv';
import { MongoClient, ObjectId } from 'mongodb';

import { IClient, IConcertPoster } from '../interfaces/interfaces.ts';

dotenv.config();

const uri = process.env.MONGO_DB_CONNECTION_STRING as string;
const dbName = process.env.MONGO_DB_NAME;

export async function connectToMongo() {
  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log('Успешное подключение к MongoDB');
  } catch (error) {
    console.error('Ошибка подключения к MongoDB:', error);
  } finally {
    await client.close();
  }
}

export async function addPoster(props: IConcertPoster) {
  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log('Успешное подключение к MongoDB');

    const db = client.db(dbName);
    const collection = db.collection(process.env.POSTERS_COLLECTION as string);

    const newPoster: IConcertPoster = {
      imageUrl: props.imageUrl,
      eventName: props.eventName,
      description: props.description,
      date: props.date,
      location: props.location,
      artists: props.artists,
      ticketPrice: props.ticketPrice,
      availableTickets: props.availableTickets,
      eventType: props.eventType,
      organizer: props.organizer
    };

    const result = await collection.insertOne(newPoster);
    console.log(`Добавлен новый постер с id: ${result.insertedId}`);
  } catch (err) {
    console.error('Ошибка при работе с базой данных:', err);
  } finally {
    await client.close();
  }
}

export async function getPosters() {
  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log('Успешное подключение к MongoDB');

    const db = client.db(dbName);
    console.log(process.env.POSTERS_COLLECTION);
    const collection = db.collection(process.env.POSTERS_COLLECTION as string);

    const posters = await collection.find({}).toArray();
    console.log(`Найдено ${posters.length} постеров`);
    return posters;
  } catch (err) {
    console.error('Ошибка при работе с базой данных:', err);
    return [];
  } finally {
    await client.close();
  }
}

export async function getPosterById(id: string) {
  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log('Успешное подключение к MongoDB');

    const db = client.db(dbName);
    const collection = db.collection(process.env.POSTERS_COLLECTION as string);

    const poster = await collection.findOne({ _id: new ObjectId(id) });
    return poster;
  } catch (err) {
    console.error('Ошибка при работе с базой данных:', err);
    return null;
  } finally {
    await client.close();
  }
}

// export async function getPostersByFilter()

export async function deletePoster(id: string) {
  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log('Успешное подключение к MongoDB');

    const db = client.db(dbName);
    const collection = db.collection(process.env.POSTERS_COLLECTION as string);

    const result = await collection.deleteOne({ _id: new ObjectId(id) });
    if (result.deletedCount === 1) {
      console.log(`Постер с id: ${id} успешно удалён`);
    } else {
      console.log(`Постер с id: ${id} не найден`);
    }
  } catch (err) {
    console.error('Ошибка при работе с базой данных:', err);
  } finally {
    await client.close();
  }
}

export async function updatePoster(id: string, updatedData: Partial<IConcertPoster>) {
  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log('Успешное подключение к MongoDB');

    const db = client.db(dbName);
    const collection = db.collection(process.env.POSTERS_COLLECTION as string);

    const result = await collection.updateOne(
      { _id: new ObjectId(id) },
      { $set: updatedData } // Обновляем только поля, которые переданы
    );

    if (result.matchedCount === 1) {
      console.log(`Постер с id: ${id} успешно обновлён`);
    } else {
      console.log(`Постер с id: ${id} не найден`);
    }
  } catch (err) {
    console.error('Ошибка при работе с базой данных:', err);
  } finally {
    await client.close();
  }
}

export async function addNewClient(props: IClient) {
  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log('Успешное подключение к MongoDB');

    const db = client.db(dbName);
    const collection = db.collection(process.env.CLIENTS_COLLECTION as string);

    const newClient: IClient = {
      username: props.username,
      password: props.password
    };

    const result = await collection.insertOne(newClient);
    console.log(`Добавлен новый клиент с id: ${result.insertedId}`);
  } catch (err) {
    console.error('Ошибка при работе с базой данных:', err);
  } finally {
    await client.close();
  }
}

export async function getUserByUsername(username: string) {
  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log('Успешное подключение к MongoDB');

    const db = client.db(dbName);
    const collection = db.collection(process.env.CLIENTS_COLLECTION as string);

    const user = await collection.findOne({ username });
    return user;
  } catch (err) {
    console.error('Ошибка при работе с базой данных:', err);
    return null;
  } finally {
    await client.close();
  }
}
