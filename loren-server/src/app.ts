import express from 'express';
import { router } from './routes';

const { auth } = require('express-openid-connect');

const config = {
  authRequired: false,
  auth0Logout: true,
  secret: '',
  baseURL: 'http://test1.bluesail.io:3000',
  clientID: 'e5irwwjliM7t7WRr9DyAThrRzxMLfPKS',
  issuerBaseURL: 'https://loren.eu.auth0.com'
};

const app = express();
app.use(auth(config));
app.use(router);


const port: number = process.env.PORT ? parseInt(process.env.PORT) : 3000;

app.listen(port, () => {
  return console.log(`Server is listening at port ${port}`);
});