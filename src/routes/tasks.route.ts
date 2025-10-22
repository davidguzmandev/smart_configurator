import { Router } from 'express';
import { generatePart, listTasks, markTaskAsDone } from '../controllers/tasks.controller';

const router = Router();

router.post('/generate-part', generatePart);
router.post('/tasks', listTasks);