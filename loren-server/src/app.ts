import express from 'express';
import { router } from './routes';


const app = express();
app.use(router);

const port: number = process.env.PORT ? parseInt(process.env.PORT) : 3000;

app.listen(port, () => {
  return console.log(`Server is listening at port ${port}`);
});