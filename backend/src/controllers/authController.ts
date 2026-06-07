import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../config/prisma';
import redis from '../config/redis';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-for-development-only';

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const admin = await prisma.adminUser.findUnique({ where: { email } });
    if (!admin || !await bcrypt.compare(password, admin.password)) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign({ userId: admin.id, email: admin.email }, JWT_SECRET, { expiresIn: '7d' });

    // Track session in Redis
    const sessionKey = `admin:session:${admin.id}:${Date.now()}`;
    await redis.setex(sessionKey, 7 * 24 * 3600, JSON.stringify({
      adminId: admin.id,
      email: admin.email,
      ip: req.ip || req.socket.remoteAddress || 'unknown',
      userAgent: req.headers['user-agent'] || 'unknown',
      createdAt: new Date().toISOString(),
    }));

    res.json({ success: true, message: 'Logged in successfully', token });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const logout = (req: Request, res: Response) => {
  res.clearCookie('admin_token');
  res.json({ success: true, message: 'Logged out successfully' });
};

export const createAdmin = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    // Check if admin already exists
    const existing = await prisma.adminUser.findUnique({ where: { email } });
    if (existing) {
      return res.status(409).json({ error: 'An admin with this email already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newAdmin = await prisma.adminUser.create({
      data: { email, password: hashedPassword },
    });

    res.status(201).json({ 
      success: true, 
      admin: { id: newAdmin.id, email: newAdmin.email, createdAt: newAdmin.createdAt } 
    });
  } catch (error) {
    console.error('Create admin error:', error);
    res.status(500).json({ error: 'Failed to create admin' });
  }
};

export const getAdmins = async (req: Request, res: Response) => {
  try {
    const admins = await prisma.adminUser.findMany({
      select: { id: true, email: true, createdAt: true },
      orderBy: { createdAt: 'asc' },
    });
    res.json({ admins });
  } catch (error) {
    console.error('Get admins error:', error);
    res.status(500).json({ error: 'Failed to fetch admins' });
  }
};

export const deleteAdmin = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    
    // Count total admins to prevent deleting the last one
    const count = await prisma.adminUser.count();
    if (count <= 1) {
      return res.status(400).json({ error: 'Cannot delete the last admin account' });
    }

    await prisma.adminUser.delete({ where: { id } });
    res.json({ success: true, message: 'Admin deleted' });
  } catch (error) {
    console.error('Delete admin error:', error);
    res.status(500).json({ error: 'Failed to delete admin' });
  }
};

export const getActiveSessions = async (_req: Request, res: Response) => {
  try {
    const keys = await redis.keys('admin:session:*');
    const sessions = [];
    for (const key of keys) {
      const data = await redis.get(key);
      if (data) {
        try {
          const parsed = JSON.parse(data);
          const ttl = await redis.ttl(key);
          sessions.push({ ...parsed, ttl, key });
        } catch { /* ignore parse errors */ }
      }
    }
    // Sort by createdAt desc
    sessions.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    res.json({ sessions });
  } catch (error) {
    console.error('Get sessions error:', error);
    res.status(500).json({ error: 'Failed to fetch sessions' });
  }
};