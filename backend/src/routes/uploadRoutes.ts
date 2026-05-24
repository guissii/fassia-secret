import { Router } from 'express';
import { handleUpload, upload } from '../controllers/uploadController';
import { authenticateAdmin } from '../middlewares/authMiddleware';

const router = Router();

// Protected route for admin
router.post('/', authenticateAdmin, upload.single('file'), handleUpload);

export default router;