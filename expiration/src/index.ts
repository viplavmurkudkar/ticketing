import { natsWrapper } from './nats-wrapper';
import { OrderCreatedListener } from './events/listeners/order-created-listener';

const start = async () => {
  if (!process.env.NATS_CLIENT_ID) {
    throw new Error('NATS_CLIENT_ID must be defined');
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

    new OrderCreatedListener(natsWrapper.client).listen();
  } catch (err) {
    console.error(err);
  }
};

start();
