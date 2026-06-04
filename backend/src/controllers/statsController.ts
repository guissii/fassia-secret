import { Request, Response } from 'express';
import redis from '../config/redis';

const TOTAL_VIEWS_KEY = 'site:views:total';
const UNIQUE_IPS_KEY = 'site:views:ips';

export const trackView = async (req: Request, res: Response) => {
  try {
    const ip = (req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown') as string;
    const cleanIp = ip.split(',')[0].trim();

    // Increment total views
    await redis.incr(TOTAL_VIEWS_KEY);

    // Add IP to set for unique visitors
    await redis.sadd(UNIQUE_IPS_KEY, cleanIp);

    res.json({ success: true });
  } catch (error) {
    console.error('Error tracking view:', error);
    res.status(500).json({ error: 'Failed to track view' });
  }
};

export const getStats = async (req: Request, res: Response) => {
  try {
    const totalViews = parseInt((await redis.get(TOTAL_VIEWS_KEY)) || '0', 10);
    const uniqueVisitors = await redis.scard(UNIQUE_IPS_KEY);

    res.json({ totalViews, uniqueVisitors });
  } catch (error) {
    console.error('Error getting stats:', error);
    res.status(500).json({ error: 'Failed to get stats' });
  }
};
