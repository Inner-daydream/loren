import { Router } from 'express';
export const router = Router();
import type { AuthRequest } from './types/index.d.ts';
import { UserController } from './controller/user';
import { authorizationMiddleware } from './middlewares/auth';
import { ROLES } from './services/constants';
router.get('/', (req: AuthRequest, res) => {
  console.log("ci")
  res.send(req.oidc?.isAuthenticated() ? 'Logged in' : 'Logged out');
});

router.get('/exemple', authorizationMiddleware([ROLES.ADMIN]), (req, res, next) => {

  res.send("You are authorized")
})

router.post('/user', UserController.create);
