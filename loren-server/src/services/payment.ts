import { PrismaClient, Subscription } from '@prisma/client';
import { env } from '../env';
import Stripe from 'stripe';
import { logger } from '../logger';
import { AppError } from '../error';
const prisma = new PrismaClient();
const stripe = new Stripe(env.STRIPE_SECRET_KEY, {
    // @ts-ignore
    apiVersion: env.STRIPE_API_VERSION,
});

const plans = {
    'basic': env.STRIPE_BASIC_PRICE_ID,
} as const;

export class CheckoutError extends AppError {
    constructor(message: string, sessionID?: string) {
        if (sessionID) {
            message += ' (Session ID: ' + sessionID + ')';
        }
        super(message);
        this.isImportant = true;
    }
}

const addSubscription = async (schoolID: string, startDate: Date, endDate: Date, quantity: number): Promise<boolean> => {
    const subscription = await prisma.subscription.create({
        data: {
            schoolId: schoolID,
            startDate: startDate,
            endDate: endDate,
            quantity: quantity,
        },
    });
    if (!subscription) {
        return false;
    }
    return true;
};

export class PaymentUnavailableError extends AppError {
    constructor(message: string) {
        super(message);
        this.isImportant = true;
    }

}

interface StripeError {
    type: string,
    message: string,
}
const handleStripeError = (err: StripeError): void => {
    switch (err.type) {
        case 'StripeInvalidRequestError':
        case 'StripeAPIError':
        case 'StripeConnectionError':
        case 'StripeAuthenticationError':
        case 'StripePermissionError':
        case 'StripeRateLimitError':
            throw new PaymentUnavailableError('Payment service unavailable: ' + err.type + ' - ' + err.message);
        default:
            throw err;
    }
};
const createCheckoutSession = async (plan: keyof typeof plans, quantity: number, schoolID: string): Promise<string> => {
    let session: Stripe.Checkout.Session;
    try {
        session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [
                {
                    price: plans[plan],
                    quantity: quantity,
                },
            ],
            mode: 'subscription',
            success_url: `${env.CLIENT_URL}/checkout/success`,
            cancel_url: `${env.CLIENT_URL}/checkout/cancel`,
        });
    }
    catch (e) {
        handleStripeError(e);
        throw e;
    }

    if (!session.url) {
        throw new CheckoutError('Could not create checkout session', session.id);
    }
    await prisma.checkoutSession.create({
        data: {
            sessionId: session.id,
            schoolId: schoolID,
        },
    });
    return session.url
};

const getActiveSubscriptions = async (schoolId: string): Promise<Subscription[]> => {
    const currentDate = new Date();
    const subscriptions: Subscription[] = await prisma.subscription.findMany({
        where: {
            schoolId: schoolId,
            startDate: {
                lte: currentDate,
            },
            endDate: {
                gte: currentDate,
            },
        },
    });
    return subscriptions;
};

// update the total quantity of allowed instances for a school
const updateTotalQuantity = async (schoolID: string): Promise<number> => {
    const subscriptions = await getActiveSubscriptions(schoolID);
    let totalQuantity: number;
    if (subscriptions.length === 0) {
        totalQuantity = 0;
    } else {
        totalQuantity = subscriptions.reduce((acc, curr) => acc + curr.quantity, 0);
    }
    try {
        await prisma.school.update({
            where: {
                id: schoolID,
            },
            data: {
                allowedInstances: totalQuantity,
            },
        });
        return totalQuantity;
    }
    catch (e) {
        if (e.code === 'P2025') {
            throw new CheckoutError('Could not find school to update sub count. schoolID: ' + schoolID);
        }
        throw e;
    }

};


const handleSuccessfulCheckout = async (sessionID: string): Promise<void> => {
    let session: Stripe.Checkout.Session;
    try {
        session = await stripe.checkout.sessions.retrieve(sessionID);
    } catch (e) {
        handleStripeError(e);
        throw e;
    }
    if (session.payment_status !== 'paid') {
        throw new CheckoutError('Payment has not been completed yet', sessionID);
    }
    const checkoutSession = await prisma.checkoutSession.findUnique({
        where: {
            sessionId: sessionID,
        },
    });
    if (!checkoutSession) {
        throw new CheckoutError('Could not find checkout session', sessionID);
    }
    if (!session.subscription) {
        throw new CheckoutError('Could not find subscription ID', sessionID);
    }
    const subscriptionID = session.subscription as string;
    let subscription: Stripe.Subscription;
    try {
        subscription = await stripe.subscriptions.retrieve(subscriptionID);
    } catch (e) {
        handleStripeError(e);
        throw e;
    }
    if (!subscription) {
        throw new CheckoutError('Could not find subscription', sessionID);
    }
    if (!subscription.items.data[0].quantity) {
        throw new CheckoutError('Could not find quantity', sessionID);
    }
    const quantity = subscription.items.data[0].quantity;
    const startDate = new Date(subscription.current_period_start * 1000);
    const endDate = new Date(subscription.current_period_end * 1000);
    const schoolId = checkoutSession.schoolId;
    addSubscription(schoolId, startDate, endDate, quantity);
    await updateTotalQuantity(schoolId);
};

const handleExpiredSubscriptions = async (sessionId: string): Promise<void> => {
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    const subscriptionId = session.subscription as string;
    if (!subscriptionId) {
        throw new CheckoutError('Could not find subscription ID', sessionId);
    }
    const subscription = await prisma.subscription.findUnique({
        where: {
            id: subscriptionId,
        },
    });
    if (!subscription) {
        throw new CheckoutError('Could not find subscription', sessionId);
    }

    const schoolId = subscription.schoolId;
    updateTotalQuantity(schoolId);
};


export const PaymentService = {
    createCheckoutSession,
    handleSuccessfulCheckout,
    handleExpiredSubscriptions,
};