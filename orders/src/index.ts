import mongoose from 'mongoose';

import { app } from './app';
import { natsWrapper } from './nats-wrapper';
import { TicketCreatedListener } from './events/listeners/ticket-created-listener';
import { TicketUpdatedListener } from './events/listeners/ticket-updated-listener';
import { ExpirationCompleteListener } from './events/listeners/expiration-complete-listener';
import { PaymentCreatedListener } from './events/listeners/payment-created-listener';

const start = async () => {
  console.log('Starting....');

  if (!process.env.JWT_KEY) {
    throw new Error('JWT_KEY must be defined');
  } //TS never assumes a env var is defined so if we don't do this check it will gives us an error when we try to access JWT_KEY
  if (!process.env.NATS_CLIENT_ID) {
    throw new Error('NATS_CLIENT_ID must be defined');
  }
  if (!process.env.MONGO_URI) {
    throw new Error('MONGO_URI must be defined');
  }
  if (!process.env.NATS_URL) {
    throw new Error('NATS_URL must be defined');
  }
  if (!process.env.NATS_CLUSTER_ID) {
    throw new Error('NATS_CLUSTER_ID must be defined');
  }

  try {
    await natsWrapper.connect(
      process.env.NATS_CLUSTER_ID,
      process.env.NATS_CLIENT_ID,
      process.env.NATS_URL
    ); //1st arg is the clusterId which we defined by assigning cid in our nats depl file(in the args section). the url we connect to(3rd arg) is the service governing access to our nats depl
    natsWrapper.client.on('close', () => {
      console.log('NATS connection closed!');
      process.exit();
    });
    process.on('SIGINT', () => natsWrapper.client.close()); //watches for interupt sigs
    process.on('SIGTERM', () => natsWrapper.client.close()); //watches for terminate sigs
    // these sigs are sent anytime TS node dev tries to restart our prog or anytime we hit ctrl c at terminal. by calling stan.close() our client reaches out to node-nats-server and tell it to not send anymore msgs to it

    new TicketCreatedListener(natsWrapper.client).listen();
    new TicketUpdatedListener(natsWrapper.client).listen();
    new ExpirationCompleteListener(natsWrapper.client).listen();
    new PaymentCreatedListener(natsWrapper.client).listen();

    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
    }); //auth is the name of the db. if none exists mongo creates a new one for us
    console.log('Connected to MongoDB');
  } catch (err) {
    console.error(err);
  }

  app.listen(3000, () => {
    console.log('listening on port 3000!');
  });
};

start();
