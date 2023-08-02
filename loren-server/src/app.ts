import express from 'express';
import { router } from './routes';
import { auth, ConfigParams } from 'express-openid-connect';
import { env } from './env';
import { debug, log } from 'console';
import { SIGNAL } from './constants';
import { handleFatalError } from './exceptions';
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

const server = app.listen(env.PORT, () => {
    return console.log(`Server is listening at port ${env.PORT}`);
});

function shutdown() {
    debug("Shutting down server");
    server.close(() => {
        debug("Server shut down");
    })
    process.exit();
}

process.on(SIGNAL.SIGTERM, shutdown);
process.on(SIGNAL.SIGINT, shutdown);

process.on('uncaughtException', handleFatalError);