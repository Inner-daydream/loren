import { Router } from 'express';
export const router = Router();
import type { AuthRequest } from './types/index.d.ts';
import { UserController } from './controller/user';
import { authorizationMiddleware } from './middlewares/auth';
import { PaymentController } from './controller/payment';
import { SchoolController } from './controller/school';

import { ROLES } from './services/constants';
import { errorHandler } from './middlewares/error';
import DefaultResponse from './DTOs/DefaultResponse';
router.get('/', (req: AuthRequest, res) => {
  res.send(req.oidc?.isAuthenticated() ? 'Logged in' : 'Logged out');
});

router.get('/exemple', authorizationMiddleware([ROLES.ADMIN]), (req, res, next) => {

  res.send("You are authorized")
})

router.post('/user', UserController.create);
router.post('/payment/checkout', PaymentController.createCheckoutSession);
router.post('/payment/checkout/success', PaymentController.handleSuccessfulCheckout);
router.post('/payment/checkout/expired', PaymentController.handleExpiredSubscriptions);

router.post('/school', SchoolController.create);

router.use(errorHandler());
