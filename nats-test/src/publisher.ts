import nats from 'node-nats-streaming';
import { TicketCreatedPublisher } from './events/ticket-created-publisher';

//we use the 'nats' lib imported above to create a client. the client is what actually connects to our NATS Streaming Server and try to exchange info with it. we call the client stan bcoz its the convention.

console.clear();

const stan = nats.connect('ticketing', 'abc', {
  url: 'http://localhost:4222',
}); //the 2nd arg of 'abc' is the Client ID

//after the client connects to the NATS Streaming Server it emits a connect event for which we listen for below. the cb provided below is executed after the conn is established.
stan.on('connect', async () => {
  console.log('Publisher connected to NATS');

  const publisher = new TicketCreatedPublisher(stan);
  try {
    await publisher.publish({
      id: '123',
      title: 'concert',
      price: 20,
    });
  } catch (err) {
    console.error(err);
  }

  // const data = JSON.stringify({
  //   id: '123',
  //   title: 'concert',
  //   price: 20,
  // });

  // stan.publish('ticket:created', data, () => {
  //   console.log('Event published');
  // }); //1st arg is the subj/channel name. 3rd arg(this is opt) is a cb funcn which is invoked after we publish the data
});
