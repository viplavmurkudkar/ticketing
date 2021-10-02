import nats from 'node-nats-streaming';
import { randomBytes } from 'crypto';
import { TicketCreatedListener } from './events/ticket-created-listener';

console.clear();

const stan = nats.connect('ticketing', randomBytes(4).toString('hex'), {
  url: 'http://localhost:4222',
});

stan.on('connect', () => {
  console.log('Listener connected to NATS');

  stan.on('close', () => {
    console.log('NATS connection closed!');
    process.exit();
  }); // this will run when we execute stan.close() below

  // const options = stan
  //   .subscriptionOptions()
  //   .setManualAckMode(true)
  //   .setDeliverAllAvailable()
  //   //setting setDeliverAllAvailable() on subscriptionOptions ensures that whenever our subscription is created, NATS sends over ALL the events that we missed before the subscription was created/ while its been down. even with setting setDurableName() we still need to provide this opt since it ensures that when our subscription is created for the 1st time, NATS sends over all the events that the subscription has received. it does this only the first time. if the listener temp goes down and comes back up NATS will ensure that it only sends the events that the listener missed out on(this happens only when we create a durable sub)
  //   .setDurableName('orders-service');
  // // setDurableName() provides an identifier for the sub we are created and thus creates a Durable subscription. we do this to manage the prob created by adding setDeliverAllAvailable().

  // const subscription = stan.subscribe(
  //   'ticket:created',
  //   'orders-service-queue-group',
  //   options
  // ); //2nd arg is the name of the queue group we want to join. we do this when we want to run multiple instances of a service and not have all these instances receive an event when it is emitted(since it would lead to data duplication). Also another adv of creating a queue group is that NATS does not dump our durable sub anytime that sub temporarily goes down/restarts.

  // subscription.on('message', (msg: Message) => {
  //   //msg is not just the raw data emitted by publisher. its got a couple of diff extra props on it in addn to that
  //   const data = msg.getData();

  //   if (typeof data === 'string') {
  //     console.log(`Received event #${msg.getSequence()}, with data: ${data} `);
  //   }

  //   msg.ack();
  // });

  new TicketCreatedListener(stan).listen();
});

process.on('SIGINT', () => stan.close()); //watches for interupt sigs
process.on('SIGTERM', () => stan.close()); //watches for terminate sigs
// these sigs are sent anytime TS node dev tries to restart our prog or anytime we hit ctrl c at terminal. by calling stan.close() our client reaches out to node-nats-server and tell it to not send anymore msgs to it
