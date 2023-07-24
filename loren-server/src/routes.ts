import { Router } from 'express';
export const router = Router();
import type { AuthRequest } from './types/index.d.ts';
// router.get('/', (req, res) => {
//     res.send('HELLO ZA WARUDO!');
//   });

router.get('/', (req: AuthRequest, res) => {
  res.send(req.oidc?.isAuthenticated() ? 'Logged in' : 'Logged out');
});