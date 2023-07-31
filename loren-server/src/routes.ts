import { Router } from 'express';
export const router = Router();
import type { AuthRequest } from './types/index.d.ts';
import { UserController } from './controller/user';
import { authorizationMiddleware } from './middlewares/auth';
import { SchoolController } from './controller/school';
import { PaymentController } from './controller/payment';


import { ROLES } from './constants';
import { errorHandler } from './middlewares/error';
import DefaultResponse from './DTOs/DefaultResponse';
router.get('/', (req: AuthRequest, res) => {
  res.send(req.oidc?.isAuthenticated() ? 'Logged in' : 'Logged out');
});

// a /login route is made available by the auth0 middleware

router.post('/user', UserController.create);

router.post('/school', authorizationMiddleware([ROLES.ADMIN]), SchoolController.create);


router.post('/payment/checkout', authorizationMiddleware([ROLES.ADMIN]), PaymentController.createCheckoutSession)
// TODO: check for the stripe signature & secret
router.post('/payment/checkout/success', PaymentController.handleSuccessfulCheckout);
router.post('/payment/checkout/expired', PaymentController.handleExpiredSubscriptions);

router.post('/school', SchoolController.create);

router.use(errorHandler());
