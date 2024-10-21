import { Db, ObjectId } from 'mongodb';
import { deleteFile } from '../../services/tebi.ts';
import { IConcertPoster } from './../../interfaces/interfaces.ts';

export async function addPoster(db: Db, props: IConcertPoster) {
  try {
    const collection = db.collection(process.env.POSTERS_COLLECTION as string);

    const newPoster: IConcertPoster = {
      imageUrls: props.imageUrls,
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
    return `Добавлен новый постер с id: ${result.insertedId}`;
  } catch (err) {
    console.error('Ошибка при работе с базой данных:', err);
  }
}

export async function getPosters(db: Db) {
  try {
    console.log(process.env.POSTERS_COLLECTION);
    const collection = db.collection(process.env.POSTERS_COLLECTION as string);

    const posters = await collection.find({}).toArray();
    console.log(`Найдено ${posters.length} постеров`);
    return posters;
  } catch (err) {
    console.error('Ошибка при работе с базой данных:', err);
    return [];
  }
}

export async function getPosterById(db: Db, id: string) {
  try {
    const collection = db.collection(process.env.POSTERS_COLLECTION as string);

    const poster = await collection.findOne({ _id: new ObjectId(id) });
    return poster;
  } catch (err) {
    console.error('Ошибка при работе с базой данных:', err);
    return null;
  }
}

export async function deletePoster(db: Db, id: string) {
  try {
    const collection = db.collection(process.env.POSTERS_COLLECTION as string);

    // Получаем постер по ID
    const poster = await collection.findOne({ _id: new ObjectId(id) });

    if (!poster) {
      console.log(`Постер с id: ${id} не найден`);
      return;
    }

    const imageUrls: string[] = poster.imageUrls;

    if (imageUrls && imageUrls.length > 0) {
      imageUrls.forEach(async (url) => {
        await deleteFile(url);
      });
    }

    const result = await collection.deleteOne({ _id: new ObjectId(id) });
    if (result.deletedCount === 1) {
      console.log(`Постер с id: ${id} успешно удалён`);
    } else {
      console.log(`Постер с id: ${id} не найден`);
    }
  } catch (err) {
    console.error('Ошибка при работе с базой данных:', err);
  }
}

export async function updatePoster(db: Db, id: string, updatedData: Partial<IConcertPoster>) {
  try {
    const collection = db.collection(process.env.POSTERS_COLLECTION as string);

    // Получаем постер по ID
    const poster = await collection.findOne({ _id: new ObjectId(id) });

    if (!poster) {
      console.log(`Постер с id: ${id} не найден`);
      return;
    }

    const imageUrls: string[] = poster.imageUrls;

    if (imageUrls && imageUrls.length > 0) {
      imageUrls.forEach(async (url) => {
        await deleteFile(url);
      });
    }

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
  }
}
