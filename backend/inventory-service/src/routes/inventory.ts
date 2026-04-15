import { Router } from 'express';
import { getInventoryOverview, getAllItems, createItem } from '../controllers/inventoryController';
import { authenticate } from '../middlewares/authMiddleware';

const router = Router();

router.get('/overview', authenticate, getInventoryOverview);
router.get('/items', authenticate, getAllItems);
router.post('/items', authenticate, createItem);

export default router;
