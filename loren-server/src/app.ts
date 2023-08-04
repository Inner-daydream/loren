import express from 'express';
import { router } from './routes';
import { auth, ConfigParams } from 'express-openid-connect';
import { env } from './env';
import { logger } from './logger';
import { SIGNAL } from './constants';
import { errorHandler } from './error';
const app = express();

let config: ConfigParams = {
    authRequired: false,
    auth0Logout: true,
    secret: env.OPENID_SECRET,
    baseURL: env.BASE_URL,
    clientID: env.OPENID_CLIENT_ID,
    issuerBaseURL: env.OPENID_ISSUER,
    routes: {
        login: "/api/login",
        logout: "/api/logout",
        callback: "/api/callback",
        postLogoutRedirect: "/api/",

    },
};

app.use(auth(config));
app.use(express.json());
app.use('/api', router);
app.use(async (error: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
    errorHandler(error, res);
});

const server = app.listen(env.PORT, () => {
    logger.info(`Server listening on port ${env.PORT}`);
});

function shutdown() {
    logger.info("Shutting down server");
    server.close(() => {
        logger.info("Server shut down");
    })
    process.exit();
}

process.on(SIGNAL.SIGTERM, shutdown);
process.on(SIGNAL.SIGINT, shutdown);

process.on('uncaughtException', errorHandler);