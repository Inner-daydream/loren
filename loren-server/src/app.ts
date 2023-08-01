import express from 'express';
import { router } from './routes';
import { auth, ConfigParams } from 'express-openid-connect';
import { env } from './env';

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

app.listen(env.PORT, () => {
    return console.log(`Server is listening at port ${env.PORT}`);
});