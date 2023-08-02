import { pino } from 'pino';

export const logger = pino({
    base: undefined,
    timestamp: true,
}, pino.destination(process.stdout));