import { PrismaClient, Subscription } from '@prisma/client';
import { env } from '../env';
import Stripe from 'stripe';

const prisma = new PrismaClient();
const stripe = new Stripe(env.STRIPE_SECRET_KEY, {
    // @ts-ignore
    apiVersion: env.STRIPE_API_VERSION,
});

const plans = {
    'basic': env.STRIPE_BASIC_PRICE_ID,
} as const;

const addSubscription = async (schoolId: string, startDate: Date, endDate: Date, quantity: number): Promise<boolean> => {
    const subscription = await prisma.subscription.create({
        data: {
            schoolId: schoolId,
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

// TODO: improve error handling once we have settled on a proper error handling strategy
const createCheckoutSession = async (plan: keyof typeof plans, quantity: number, schoolId: string): Promise<string> => {
    const session = await stripe.checkout.sessions.create({
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
    })

    if (!session.url) {
        throw new Error('Could not create session');
    }
    console.log('session:', session, 'url:', session.url)

    try {
        await prisma.checkoutSession.create({
            data: {
                sessionId: session.id,
                schoolId: schoolId,
            },
        });
    } catch (e) {
        console.log(e);
        throw e;
    }
    return session.url
};

const getActiveSubscriptions = async (schoolId: string) => {
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
const updateTotalQuantity = async (schoolId: string): Promise<number> => {
    const subscriptions = await getActiveSubscriptions(schoolId);
    let totalQuantity: number;
    if (!subscriptions) {
        totalQuantity = 0;
    } else {
        totalQuantity = subscriptions.reduce((acc, curr) => acc + curr.quantity, 0);
    }
    await prisma.school.update({
        where: {
            id: schoolId,
        },
        data: {
            allowedInstances: totalQuantity,
        },
    });
    return totalQuantity;
};

export class CheckoutError extends Error {
    constructor(message: string, sessionId: string) {
        super(message + '\n-  Session ID: ' + sessionId);
    }
}
const handleSuccessfulCheckout = async (sessionId: string): Promise<void> => {
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    if (session.payment_status !== 'paid') {
        throw new CheckoutError('Payment has not been completed yet', sessionId);
    }
    const checkoutSession = await prisma.checkoutSession.findUnique({
        where: {
            sessionId: sessionId,
        },
    });
    if (!checkoutSession) {
        throw new CheckoutError('Could not find checkout session', sessionId);
    }
    const subscriptionId = session.subscription as string;
    if (!subscriptionId) {
        throw new CheckoutError('Could not find subscription ID', sessionId);
    }
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    if (!subscription) {
        throw new CheckoutError('Could not find subscription', sessionId);
    }
    const quantity = subscription.items.data[0].quantity;
    if (!quantity) {
        throw new CheckoutError('Could not find quantity', sessionId);
    }
    const startDate = new Date(subscription.current_period_start * 1000);
    const endDate = new Date(subscription.current_period_end * 1000);
    const schoolId = checkoutSession.schoolId;
    addSubscription(schoolId, startDate, endDate, quantity);
    console.log('Added subscription for school ' + schoolId + ' from ' + startDate + ' to ' + endDate);
    const allowedQuantity = await updateTotalQuantity(schoolId);
    console.log('Updated total quantity for school ' + schoolId + ' to ' + allowedQuantity);
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
    const allowedQuantity = updateTotalQuantity(schoolId);
    console.log('Updated total quantity for school ' + schoolId + ' to ' + allowedQuantity);
};


export const PaymentService = {
    createCheckoutSession,
    handleSuccessfulCheckout,
    handleExpiredSubscriptions,
};