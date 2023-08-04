import { cleanEnv, port, str, url, bool } from 'envalid';

export const env = cleanEnv(process.env, {
    OPENID_SECRET: str({ desc: 'The secret used to sign the JWTs' }),
    BASE_URL: url({ desc: 'The base URL of the server' }),
    OPENID_CLIENT_ID: str({ desc: 'The client ID of the auth0 client' }),
    OPENID_ISSUER: url({ desc: 'The issuer URL of the auth0 client' }),
    PORT: port({ desc: 'The port to listen on', default: 3000 },),
    AUTH0_DOMAIN: str({ desc: 'The auth0 domain' }),
    AUTH0_TOKEN: str({ desc: 'The auth0 token' }),
    AUTH0_CONNECTION: str({ desc: 'The auth0 connection (the name of the user database)' }),
    CLIENT_URL: url({ desc: 'The URL of the client' }),
    STRIPE_BASIC_PRICE_ID: str({ desc: 'The ID of the basic plan in Stripe' }),
    STRIPE_SECRET_KEY: str({ desc: 'The secret key of the Stripe account' }),
    STRIPE_API_VERSION: str({ desc: 'The API version of Stripe (https://stripe.com/docs/api/versioning)' }),
    LOG_LEVEL: str({ desc: 'The log level', default: 'info' }),
});
