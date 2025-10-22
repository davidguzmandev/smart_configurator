import { Router } from 'express';
import { generatePart, listTasks, markTaskAsDone } from '../controllers/tasks.controller';

const router = Router();

router.post('/generate-part', generatePart);
router.get('/tasks', listTasks);
router.patch('/update-task/:id', markTaskAsDone);

export default router;