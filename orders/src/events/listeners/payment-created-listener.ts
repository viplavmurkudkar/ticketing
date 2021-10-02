import {
  Subjects,
  Listener,
  PaymentCreatedEvent,
  OrderStatus,
} from '@vmticketsapp/common';
import { Message } from 'node-nats-streaming';
import { queueGroupName } from './queue-group-name';
import { Order } from '../../models/order';

export class PaymentCreatedListener extends Listener<PaymentCreatedEvent> {
  readonly subject = Subjects.PaymentCreated;
  queueGroupName = queueGroupName;

  async onMessage(data: PaymentCreatedEvent['data'], msg: Message) {
    const order = await Order.findById(data.orderId);

    if (!order) {
      throw new Error('Order not found!');
    }

    order.set({
      status: OrderStatus.Complete,
    });
    await order.save();
    // we are making a change to our order here and saving it. ideally we should emit an event informing other parts of our app about the same to avoid any issues related to versioning. however in the context of our app, once an order goes into the complete status thats it! there won't be any further updates to that order

    msg.ack();
  }
}
