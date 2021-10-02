import { Message } from 'node-nats-streaming';
import { Listener } from './base-listener';
import { TicketCreatedEvent } from './ticket-created-event';
import { Subjects } from './subjects';

//by including a generic type below we ensure that the subject in TicketCreatedListener is exactly equal to the one defined in TicketCreatedEvent interface
export class TicketCreatedListener extends Listener<TicketCreatedEvent> {
  readonly subject = Subjects.TicketCreated; // readonly prevents a prop of a class from being changed(similar to final in Java)
  //subject: Subjects.TicketCreated = Subjects.TicketCreated; //need to provide the type anno separately here to get rid of TS err. this is to ensure that the subject is always of type Subjects.TicketCreated and not one of the other types in the Subjects enum. we could also do following: readonly subject = Subjects.TicketCreated;
  queueGroupName = 'payments-service';

  onMessage(data: TicketCreatedEvent['data'], msg: Message) {
    console.log('Event data!', data);

    msg.ack();
  }
}
