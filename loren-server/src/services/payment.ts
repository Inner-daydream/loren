import { PrismaClient } from '@prisma/client';
import { env } from '../env';
import Stripe from 'stripe';
import { cpSync } from 'fs';

const prisma = new PrismaClient();
const stripe = new Stripe(env.STRIPE_SECRET_KEY, {
    // @ts-ignore
    apiVersion: env.STRIPE_API_VERSION,
});

const plans = {
    'basic': env.STRIPE_BASIC_PRICE_ID,
} as const;

const addSubscription = async (schoolId: string, startDate: Date, endDate: Date) => {

    const subscription = await prisma.subscription.create({
        data: {
            schoolId: schoolId,
            startDate: startDate,
            endDate: endDate,
        },
    });

};

const createCheckoutSession = async (plan: keyof typeof plans, quantity: number, schoolId: string): Promise<string> => {
    // TODO: improve error handling once we have settled on a proper error handling strategy
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

export class CheckoutError extends Error {
    constructor(message: string, sessionId: string) {
        super(message + ' Session ID: ' + sessionId);
    }
}
const handleSuccessfulCheckout = async (sessionId: string): Promise<void> => {
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    if (session.payment_status !== 'paid') {
        throw new Error('Payment hasn not been completed yet');
    }
    const checkoutSession = await prisma.checkoutSession.findUnique({
        where: {
            sessionId: sessionId,
        },
    });
    if (!checkoutSession) {
        throw new CheckoutError('Could not find checkout session', sessionId);
    }
    const quantity = session.line_items?.data[0].quantity;
    if (!quantity) {
        throw new CheckoutError('Could not find quantity for session', sessionId);
    }
    const subscriptionId = session.subscription as string;
    if (!subscriptionId) {
        throw new CheckoutError('Could not find subscription ID', sessionId);
    }
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    if (!subscription) {
        throw new CheckoutError('Could not find subscription', sessionId);
    }
    const startDate = new Date(subscription.current_period_start * 1000);
    const endDate = new Date(subscription.current_period_end * 1000);
    const schoolId = checkoutSession.schoolId;
    addSubscription(schoolId, startDate, endDate);
    console.log('Added subscription for school ' + schoolId + ' from ' + startDate + ' to ' + endDate);
};

export const PaymentService = {
    createCheckoutSession,
    addSubscription,
    handleSuccessfulCheckout,
};