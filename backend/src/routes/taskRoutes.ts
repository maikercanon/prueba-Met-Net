import { Router } from 'express';
import { createTask, deleteTask, getTasks, updateTask } from '../controllers/taskController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// All task routes require authentication
router.use(authenticateToken);

router.get('/tasks', getTasks);
router.post('/tasks', createTask);
router.put('/tasks/:id', updateTask);
router.delete('/tasks/:id', deleteTask);

export default router;
