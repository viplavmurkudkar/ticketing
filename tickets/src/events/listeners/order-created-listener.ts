import { Message } from 'node-nats-streaming';
import { Listener, OrderCreatedEvent, Subjects } from '@vmticketsapp/common';
import { queueGroupName } from './queue-group-name';
import { Ticket } from '../../models/ticket';
import { TicketUpdatedPublisher } from '../publishers/ticket-updated-publisher';

export class OrderCreatedListener extends Listener<OrderCreatedEvent> {
  readonly subject = Subjects.OrderCreated;
  queueGroupName = queueGroupName;

  async onMessage(data: OrderCreatedEvent['data'], msg: Message) {
    // when an order is created we need to reserve/lock the corresponding ticket in our tickets db so the owner cannot edit the price / details about the ticket

    // Find the ticket that order is reserving
    const ticket = await Ticket.findById(data.ticket.id);

    // If no ticket, throw error
    if (!ticket) {
      throw new Error('Ticket not found');
    }

    // Mark the ticket as being reserved by setting its orderId property
    ticket.set({ orderId: data.id });

    // save the ticket
    await ticket.save(); //since anytime we update a ticket/doc in our app, its version number is increased by 1, we need to emit an event telling our other srvs that the ticket was updated to keep the other srvs that have replicated data(like orders srv) in sync

    await new TicketUpdatedPublisher(this.client).publish({
      id: ticket.id,
      price: ticket.price,
      title: ticket.title,
      userId: ticket.userId,
      orderId: ticket.orderId,
      version: ticket.version,
    }); // we await this to make sure that if something goes wrong while publishing an error is emitted and we don't go and execute the msg.ack() line

    // ack the message
    msg.ack();
  }
}
