import { Router } from 'express';
import {
  getOfficialShops,
  createOfficialShop,
  updateOfficialShop,
  deleteOfficialShop,
} from '../controllers/officialShopController';
import { authenticateAdmin } from '../middlewares/authMiddleware';

const router = Router();

router.get('/', getOfficialShops);
router.post('/', authenticateAdmin, createOfficialShop);
router.put('/:id', authenticateAdmin, updateOfficialShop);
router.delete('/:id', authenticateAdmin, deleteOfficialShop);

export default router;
