import express from 'express';
import { router } from './routes';
import { auth } from 'express-openid-connect';
import { env } from './env';



const config = {
  authRequired: false,
  auth0Logout: true,
  secret: env.OPENID_SECRET,
  baseURL: env.BASE_URL,
  clientID: env.OPENID_CLIENT_ID,
  issuerBaseURL: env.OPENID_ISSUER,
};


const app = express();

app.use(auth(config));
app.use(express.json());
app.use('/api', router);

app.listen(env.PORT, () => {
  return console.log(`Server is listening at port ${env.PORT}`);
});