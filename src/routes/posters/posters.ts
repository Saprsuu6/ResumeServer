import express, { Request, Response } from 'express';

import { Db } from 'mongodb';
import { IConcertPoster } from '../../interfaces/interfaces.ts';
import { authenticateToken, handleValidationErrors, validatePoster } from '../../middlewares/middlewares.ts';
import { connectToMongo } from '../../services/database/mongo_config.ts';
import { addPoster, deletePoster, getPosterById, getPosters, updatePoster } from '../../services/database/posters.ts';

const postersRouter = express.Router();

postersRouter
  .route('/posters')
  .post(authenticateToken, validatePoster, handleValidationErrors, async (req: Request, res: Response) => {
    try {
      const poster: IConcertPoster = req.body;

      const result = await connectToMongo(async (dbConnection: Db, poster: IConcertPoster) => {
        await addPoster(dbConnection, poster);
      }, poster);
      res.status(201).json({ message: result });
    } catch (error) {
      res.status(500).json({ error: 'Ошибка при добавлении постера' });
    }
  });

postersRouter.route('/posters').get(async (_, res) => {
  try {
    const posters = await connectToMongo(async (dbConnection: Db) => {
      await getPosters(dbConnection);
    });
    res.status(200).json(posters);
  } catch (error) {
    res.status(500).json({ error: 'Ошибка при получении постеров' });
  }
});

postersRouter.route('/posters/byId/:id').get(async (req, res) => {
  try {
    const { id } = req.params;

    const posters = await connectToMongo(async (dbConnection: Db, id) => {
      await getPosterById(dbConnection, id);
    }, id);
    res.status(200).json(posters);
  } catch (error) {
    res.status(500).json({ error: 'Ошибка при получении постеров' });
  }
});

postersRouter.route('/posters/:id').delete(authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await connectToMongo(async (dbConnection: Db, id: string) => {
      await deletePoster(dbConnection, id);
    }, id);
    res.status(200).json({ message: result });
  } catch (error) {
    res.status(500).json({ error: 'Ошибка при удалении постера' });
  }
});

postersRouter
  .route('/posters/:id')
  .put(authenticateToken, validatePoster, handleValidationErrors, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const updatedData: Partial<IConcertPoster> = req.body;
      const result = await connectToMongo(
        async (dbConnection: Db, id: string, updatedData: Partial<IConcertPoster>) => {
          await updatePoster(dbConnection, id, updatedData);
        },
        id,
        updatedData
      );
      res.status(200).json({ message: result });
    } catch (error) {
      res.status(500).json({ error: 'Ошибка при обновлении постера' });
    }
  });

export default postersRouter;
