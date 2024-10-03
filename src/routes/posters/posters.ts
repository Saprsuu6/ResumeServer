import express, { Request, Response } from 'express';

import { IConcertPoster } from '../../interfaces/interfaces.ts';
import { authenticateToken, handleValidationErrors, validatePoster } from '../../middlewares/middlewares.ts';
import { addPoster, deletePoster, getPosterById, getPosters, updatePoster } from '../../services/mongoDb.ts';

const postersRouter = express.Router();

postersRouter
  .route('/posters')
  .post(authenticateToken, validatePoster, handleValidationErrors, async (req: Request, res: Response) => {
    try {
      const poster: IConcertPoster = req.body;
      await addPoster(poster);
      res.status(201).json({ message: 'Постер успешно добавлен' });
    } catch (error) {
      res.status(500).json({ error: 'Ошибка при добавлении постера' });
    }
  });

postersRouter.route('/posters').get(async (_, res) => {
  try {
    const posters = await getPosters();
    res.status(200).json(posters);
  } catch (error) {
    res.status(500).json({ error: 'Ошибка при получении постеров' });
  }
});

postersRouter.route('/posters/byId/:id').get(async (req, res) => {
  try {
    const { id } = req.params;
    const poster = await getPosterById(id);
    res.status(200).json(poster);
  } catch (error) {
    res.status(500).json({ error: 'Ошибка при получении постеров' });
  }
});

postersRouter.route('/posters/:id').delete(authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    await deletePoster(id);
    res.status(200).json({ message: `Постер с id ${id} успешно удалён` });
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
      await updatePoster(id, updatedData);
      res.status(200).json({ message: `Постер с id ${id} успешно обновлён` });
    } catch (error) {
      res.status(500).json({ error: 'Ошибка при обновлении постера' });
    }
  });

export default postersRouter;
