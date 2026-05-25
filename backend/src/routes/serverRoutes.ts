import { Router } from 'express';
import os from 'os';
import { authenticateAdmin } from '../middlewares/authMiddleware';

const router = Router();

router.get('/', authenticateAdmin, (req, res) => {
  res.json({
    platform: os.platform(),
    arch: os.arch(),
    totalMem: os.totalmem(),
    freeMem: os.freemem(),
    cpus: os.cpus().length,
    uptime: os.uptime(),
    loadAvg: os.loadavg()
  });
});

export default router;
