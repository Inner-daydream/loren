import { Router } from 'express';

import type { AuthRequest } from './types/index.d.ts';
import { ROLES } from './constants';

import { UserController } from './controller/user';
import { SchoolController } from './controller/school';
import { PaymentController } from './controller/payment';

import { errorHandler } from './middlewares/error';
import { authorizationMiddleware } from './middlewares/auth';

export const router = Router();
router.use(errorHandler());

router.get('/', (req: AuthRequest, res) => {
  res.send(req.oidc?.isAuthenticated() ? 'Logged in' : 'Logged out');
});

router.get('/role-debug', authorizationMiddleware([ROLES.ADMIN, ROLES.TEACHER, ROLES.STUDENT]), (req: AuthRequest, res) => {
  res.send(req.oidc?.user);
});

// a /login route is made available by the auth0 middleware

router.post('/user', UserController.create);

router.post('/school', authorizationMiddleware([ROLES.ADMIN]), SchoolController.create);


router.post('/payment/checkout', authorizationMiddleware([ROLES.ADMIN]), PaymentController.createCheckoutSession)
// TODO: check for the stripe signature & secret
router.post('/payment/checkout/success', PaymentController.handleSuccessfulCheckout);
router.post('/payment/checkout/expired', PaymentController.handleExpiredSubscriptions);



