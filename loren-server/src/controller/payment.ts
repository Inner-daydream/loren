import { PaymentService } from '../services/payment';
import { Request, Response, NextFunction } from 'express';
import zod from 'zod';

const CreateSchema = zod.object({
    plan: zod.string(),
    quantity: zod.number(),
    schoolId: zod.string(),
});

const createCheckoutSession = async (req: Request, res: Response, next: NextFunction) => {

    try {
        CreateSchema.parse(req.body);
    } catch (e) {
        return next(e);
    }
    // schoolId is expected from the auth middleware, but it doesn't implement this yet, for debugging purposes, we get it from the request.
    const { plan, quantity, schoolId } = req.body;
    try {
        const url = await PaymentService.createCheckoutSession(plan, quantity, schoolId);
        res.status(201).json({
            url: url,
            message: 'Checkout session created successfully'
        });
    } catch (e) {
        return next(e);
    }
}

const handleSuccessfulCheckout = (req: Request, res: Response, next: NextFunction) => {
    const session = req.body.data.object;
    PaymentService.handleSuccessfulCheckout(session.id);
}

const handleExpiredSubscriptions = (req: Request, res: Response, next: NextFunction) => {
    const session = req.body.data.object;
    PaymentService.handleExpiredSubscriptions(session.id);
}

export const PaymentController = {
    createCheckoutSession,
    handleSuccessfulCheckout,
    handleExpiredSubscriptions,
};