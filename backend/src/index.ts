import cluster from 'cluster';
import os from 'os';
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import hpp from 'hpp';
import compression from 'compression';

import authRoutes from './routes/authRoutes';
import productRoutes from './routes/productRoutes';
import orderRoutes from './routes/orderRoutes';
import categoryRoutes from './routes/categoryRoutes';
import bannerRoutes from './routes/bannerRoutes';
import promoRoutes from './routes/promoRoutes';
import serverRoutes from './routes/serverRoutes';
import collectionRoutes from './routes/collectionRoutes';

dotenv.config();

const PORT = process.env.PORT || 5000;
const NUM_WORKERS = parseInt(process.env.NODE_WORKERS || '') || os.cpus().length;

function createApp() {
  const app = express();

  // Optimization: Compress HTTP responses (gzip/brotli)
  app.use(compression({
    level: 6,
    filter: (req, res) => {
      if (req.headers['x-no-compression']) return false;
      return compression.filter(req, res);
    }
  }));

  // Security Middlewares
  app.use(helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
  }));

  // Rate limiting: max 1000 requests per 15 minutes per IP (augmenté pour 6 workers)
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 1000,
    standardHeaders: true,
    legacyHeaders: false,
    message: 'Too many requests from this IP, please try again later.'
  });
  app.use('/api', limiter);

  // Standard Middlewares
  app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true
  }));

  // Body parser with size limit increased for base64 images
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  app.use(hpp());
  app.use(cookieParser());

  // Routes
  app.use('/api/auth', authRoutes);
  app.use('/api/products', productRoutes);
  app.use('/api/orders', orderRoutes);
  app.use('/api/categories', categoryRoutes);
  app.use('/api/banners', bannerRoutes);
  app.use('/api/promos', promoRoutes);
  app.use('/api/server', serverRoutes);
  app.use('/api/collections', collectionRoutes);

  return app;
}

// Cluster mode: utilise tous les vCPU disponibles
if (cluster.isPrimary) {
  console.log(`Master ${process.pid} is running`);
  console.log(`Starting ${NUM_WORKERS} workers...`);

  for (let i = 0; i < NUM_WORKERS; i++) {
    cluster.fork();
  }

  cluster.on('exit', (worker) => {
    console.log(`Worker ${worker.process.pid} died. Restarting...`);
    cluster.fork();
  });
} else {
  const app = createApp();
  const server = app.listen(PORT, () => {
    console.log(`Worker ${process.pid} running on port ${PORT}`);
  });

  // Keep-alive tuning pour haute performance
  server.keepAliveTimeout = 65 * 1000;
  server.headersTimeout = 66 * 1000;
}