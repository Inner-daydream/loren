import { pino } from 'pino';
import { env } from './env';

export const logger = pino({
    base: undefined,
    timestamp: true,
    level: env.LOG_LEVEL,

}, pino.destination(process.stdout));