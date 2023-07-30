import { PaymentService } from '../services/payment';
import { Request, Response, NextFunction } from 'express';

const createCheckoutSession = async (req: Request, res: Response, next: NextFunction) => {

    // schoolId is expected from the auth middleware, but it doesn't implement this yet, for debugging purposes, we get it from the request.
    const { plan, quantity, schoolId } = req.body;
    if (!plan || !quantity || !schoolId) {
        res.status(400).json({ error: 'Missing fields' });
        return;
    }
    try {
        const url = await PaymentService.createCheckoutSession(plan, quantity, schoolId);
        res.status(201).json({ url: url });
    } catch (e) {
        console.log(e);
        res.status(500);
    }
}

// webhook
const handleSuccessfulCheckout = (req: Request, res: Response, next: NextFunction) => {
    const session = req.body.data.object;
    console.log("session completed: ", session.id);
    PaymentService.handleSuccessfulCheckout(session.id);
}

export const PaymentController = {
    createCheckoutSession,
};