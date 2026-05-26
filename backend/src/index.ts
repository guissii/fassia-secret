import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import path from 'path';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import hpp from 'hpp';
import compression from 'compression';

import authRoutes from './routes/authRoutes';
import productRoutes from './routes/productRoutes';
import orderRoutes from './routes/orderRoutes';
import categoryRoutes from './routes/categoryRoutes';
import bannerRoutes from './routes/bannerRoutes';
import uploadRoutes from './routes/uploadRoutes';
import promoRoutes from './routes/promoRoutes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Optimization: Compress HTTP responses (gzip)
app.use(compression());

// Security Middlewares
app.use(helmet()); // Set security HTTP headers
app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin" })); // Allow images to be loaded cross-origin

// Rate limiting: max 100 requests per 15 minutes per IP
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api', limiter);

// Standard Middlewares
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));

// Body parser with size limit to prevent Payload Too Large attacks (DoS), increased for base64 images
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.use(hpp()); // Prevent HTTP Parameter Pollution
app.use(cookieParser());
app.use('/uploads', express.static(path.join(__dirname, '../../public/uploads'), { maxAge: '1y' })); // Cache uploaded images

import serverRoutes from './routes/serverRoutes';

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/banners', bannerRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/server', serverRoutes);
app.use('/api/promos', promoRoutes);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});