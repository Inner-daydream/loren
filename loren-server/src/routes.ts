import { Router } from 'express';
export const router = Router();
import type { AuthRequest } from './types/index.d.ts';
import { UserController } from './controller/user';

router.get('/', (req: AuthRequest, res) => {
  res.send(req.oidc?.isAuthenticated() ? 'Logged in' : 'Logged out');
});

router.post('/user', UserController.create);
