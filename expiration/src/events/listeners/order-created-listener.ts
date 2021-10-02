import { Listener, OrderCreatedEvent, Subjects } from '@vmticketsapp/common';
import { Message } from 'node-nats-streaming';
import { queueGroupName } from './queue-group-name';
import { expirationQueue } from '../../queues/expiration-queue';

export class OrderCreatedListener extends Listener<OrderCreatedEvent> {
  readonly subject = Subjects.OrderCreated;
  queueGroupName = queueGroupName;

  async onMessage(data: OrderCreatedEvent['data'], msg: Message) {
    const delay = new Date(data.expiresAt).getTime() - new Date().getTime();
    console.log('Waiting this many ms to process the job:', delay);
    // we create a new job here and queue it up
    await expirationQueue.add(
      {
        orderId: data.id, //id of the order created
      },
      {
        delay, //whatever time in ms we add here is the delay that is added in b4 we get the job back from redis for processing
      }
    ); // the 1st arg to add() is the payload for the job. 2nd arg is the options obj

    msg.ack();
  }
}
