import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { Users } from '../db';
import { requireAuth, signToken } from '../middleware/auth';

export const authRouter = Router();

// POST /api/auth/register
authRouter.post('/register', async (req, res) => {
  const { email, password } = req.body as { email?: string; password?: string };
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password required' });
  }
  if (password.length < 8) {
    return res.status(400).json({ error: 'Password must be at least 8 characters' });
  }
  if (Users.findByEmail(email)) {
    return res.status(409).json({ error: 'Account already exists with that email' });
  }
  const passwordHash = await bcrypt.hash(password, 12);
  const userId = Users.create(email, passwordHash);
  const token = signToken({ userId, email });
  return res.status(201).json({ token, user: { id: userId, email } });
});

// POST /api/auth/login
authRouter.post('/login', async (req, res) => {
  const { email, password } = req.body as { email?: string; password?: string };
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password required' });
  }
  const user = Users.findByEmail(email);
  if (!user || !(await bcrypt.compare(password, user.password_hash))) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }
  const token = signToken({ userId: user.id, email: user.email });
  return res.json({ token, user: { id: user.id, email: user.email } });
});

// GET /api/auth/me
authRouter.get('/me', requireAuth, (req, res) => {
  res.json({ user: req.user });
});
