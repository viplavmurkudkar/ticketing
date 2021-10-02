import express from 'express';
import 'express-async-errors';
import { json } from 'body-parser';
import cookieSession from 'cookie-session';
import { errorHandler, NotFoundError, currentUser } from '@vmticketsapp/common';

import { createTicketRouter } from './routes/new';
import { showTicketRouter } from './routes/show';
import { indexTicketRouter } from './routes';
import { updateTicketRouter } from './routes/update';

//we create this app file to get supertest lib to work well. we need access to app for supertest to work. also on index.ts we auto start listening on port 3000 which can cause issues when we are trying to test diff services at same time. however acc to default logic of supertest if server is not listening for connections then it will auto start listening on some random available port and thus solving our problem. all we do here is create our express app and export it(the app is not listening on any port here)

const app = express();
app.set('trust proxy', true); //traffic is being proxied to our app thru ingress nginx. express sees this and by default does not trust the https connection. we do this to make express aware that it is behind a proxy and to still trust the traffic as being secure even if its coming from a proxy.
app.use(json());
app.use(
  cookieSession({
    signed: false, //to disable encryption
    secure: process.env.NODE_ENV !== 'test', //to ensure that users only visit our app over HTTPS. if we're in the test env, secure is set to false to allow us to get cookie using Supertest(it only make HTTP calls instead of HTTPS)
  })
);
app.use(currentUser);

app.use(createTicketRouter);
app.use(showTicketRouter);
app.use(indexTicketRouter);
app.use(updateTicketRouter);

app.all('*', async (req, res) => {
  throw new NotFoundError();
});

app.use(errorHandler);

export { app }; //named export
