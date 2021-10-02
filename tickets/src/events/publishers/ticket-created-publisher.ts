import { Publisher, Subjects, TicketCreatedEvent } from '@vmticketsapp/common';

export class TicketCreatedPublisher extends Publisher<TicketCreatedEvent> {
  readonly subject = Subjects.TicketCreated;
}
