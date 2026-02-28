import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export const JWT_SECRET = process.env.JWT_SECRET ?? 'dev-secret-CHANGE-IN-PRODUCTION';

export interface AuthPayload {
  userId: string;
  email: string;
}

// Augment Express's Request type so TypeScript knows about req.user
declare global {
  namespace Express {
    interface Request {
      user?: AuthPayload;
    }
  }
}

export function signToken(payload: AuthPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

/**
 * Middleware that enforces a valid JWT.
 * Accepts the token from the Authorization header OR a `token` query param
 * (needed for EventSource, which cannot set custom headers).
 */
export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  const header = req.headers.authorization?.replace('Bearer ', '');
  const query  = typeof req.query.token === 'string' ? req.query.token : undefined;
  const raw    = header ?? query;

  if (!raw) {
    res.status(401).json({ error: 'Authentication required' });
    return;
  }
  try {
    req.user = jwt.verify(raw, JWT_SECRET) as AuthPayload;
    next();
  } catch {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
}
