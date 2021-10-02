import { Message } from 'node-nats-streaming';
import { Subjects, Listener, TicketCreatedEvent } from '@vmticketsapp/common';
import { Ticket } from '../../models/ticket';
import { queueGroupName } from './queue-group-name';

export class TicketCreatedListener extends Listener<TicketCreatedEvent> {
  readonly subject = Subjects.TicketCreated;
  queueGroupName = queueGroupName;

  async onMessage(data: TicketCreatedEvent['data'], msg: Message) {
    const { id, title, price } = data;
    //whenever we try to replicate data btw diff srvs we need to make sure that we are using consistent ids btw them. so below when we save the ticket that we receive over an event(from tickets srv) into our orders srv db, we need to make sure that it has the same id as the ticket in tickets srv db.
    const ticket = Ticket.build({ id, title, price });
    await ticket.save();

    msg.ack();
  }
}
