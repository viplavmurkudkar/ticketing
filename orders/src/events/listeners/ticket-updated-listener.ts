import { Message } from 'node-nats-streaming';
import { Subjects, Listener, TicketUpdatedEvent } from '@vmticketsapp/common';
import { Ticket } from '../../models/ticket';
import { queueGroupName } from './queue-group-name';

export class TicketUpdatedListener extends Listener<TicketUpdatedEvent> {
  readonly subject = Subjects.TicketUpdated;
  queueGroupName = queueGroupName;

  async onMessage(data: TicketUpdatedEvent['data'], msg: Message) {
    // const ticket = await Ticket.findOne({
    //   _id: data.id,
    //   version: data.version - 1, //the current ver inside the Tickets collection in our Orders service should be one less than the version that we get from the Ticket service(thru the TicketUpdatedEvent). only then would we process the update. if this condition is not met then we are possibly processing events out of order and will thus throw an err on the next line.
    // });

    const ticket = await Ticket.findByEvent(data);

    if (!ticket) {
      return console.log(`Ticket version ${data.version} coming out of order`);
    }

    const { title, price } = data;
    ticket.set({ title, price });
    await ticket.save(); //on doing this the version of the ticket inside the Tickets collection in our Orders service is incremented by 1 and will now thus match the version of the ticket in Tickets service

    msg.ack();
  }
}
