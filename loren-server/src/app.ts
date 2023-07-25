import express from 'express';
import { router } from './routes';
import { auth } from 'express-openid-connect';

const config = {
  authRequired: false,
  auth0Logout: true,
  secret: process.env.OPENID_SECRET,
  baseURL: process.env.BASE_URL,
  clientID: process.env.OPENID_CLIENT_ID,
  issuerBaseURL: process.env.OPENID_ISSUER,
};
const app = express();

app.use(auth(config));
app.use(router);


const port: number = process.env.PORT ? parseInt(process.env.PORT) : 3000;

app.listen(port, () => {
  return console.log(`Server is listening at port ${port}`);
});