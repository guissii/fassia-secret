import { Router } from 'express';
import {
  getOfficialShops,
  createOfficialShop,
  updateOfficialShop,
  deleteOfficialShop,
} from '../controllers/officialShopController';

const router = Router();

router.get('/', getOfficialShops);
router.post('/', createOfficialShop);
router.put('/:id', updateOfficialShop);
router.delete('/:id', deleteOfficialShop);

export default router;
