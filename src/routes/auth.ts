import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User, IUser } from '../models/User.ts';
import { authMiddleware, AuthRequest } from '../middleware/auth.ts';
import { demoUsers } from '../lib/demoStore.ts';

const router = express.Router();

// Signup
router.post('/signup', async (req, res) => {
  const isDemo = (req as any).isDemoMode;
  try {
    const { name, email, password, consumer_no_ke } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Please provide all required fields' });
    }

    let user: any;
    if (isDemo) {
      user = demoUsers.find(u => u.email === email);
      if (user) return res.status(400).json({ error: 'User already exists' });
      
      user = {
        _id: Math.random().toString(36).substring(7),
        name,
        email,
        password_hash: await bcrypt.hash(password, 10),
        consumer_no_ke: consumer_no_ke || '',
      };
      demoUsers.push(user);
    } else {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ error: 'User already exists' });
      }

      const salt = await bcrypt.genSalt(10);
      const password_hash = await bcrypt.hash(password, salt);

      user = new User({
        name,
        email,
        password_hash,
        consumer_no_ke: consumer_no_ke || '',
      }) as IUser;

      await user.save();
    }

    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET || 'fallback_secret',
      { expiresIn: '7d' }
    );

    res.status(201).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        consumer_no_ke: user.consumer_no_ke,
      },
    });
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ error: 'Server error during signup', details: err.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  const isDemo = (req as any).isDemoMode;
  try {
    const { email, password } = req.body;

    let user: any;
    if (isDemo) {
      user = demoUsers.find(u => u.email === email);
    } else {
      user = (await User.findOne({ email })) as IUser | null;
    }

    if (!user) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user._id || user.id, email: user.email },
      process.env.JWT_SECRET || 'fallback_secret',
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        consumer_no_ke: user.consumer_no_ke,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error during login' });
  }
});

// Get current user
router.get('/me', authMiddleware, async (req: AuthRequest, res) => {
  const isDemo = (req as any).isDemoMode;
  try {
    let user: any;
    if (isDemo) {
      user = demoUsers.find(u => u._id === req.user?.id);
      if (user) {
        const { password_hash, ...userData } = user;
        user = userData;
      }
    } else {
      user = await User.findById(req.user?.id).select('-password_hash');
    }

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error fetching user' });
  }
});

// Update appliances
router.post('/appliances', authMiddleware, async (req: AuthRequest, res) => {
  const isDemo = (req as any).isDemoMode;
  try {
    let user: any;
    if (isDemo) {
      const userIdx = demoUsers.findIndex(u => u._id === req.user?.id);
      if (userIdx !== -1) {
        demoUsers[userIdx].appliances = req.body;
        user = demoUsers[userIdx];
      }
    } else {
      user = await User.findByIdAndUpdate(
        req.user?.id,
        { appliances: req.body },
        { new: true }
      ).select('-password_hash');
    }

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ error: 'Server error updating appliances', details: err.message });
  }
});

export default router;
