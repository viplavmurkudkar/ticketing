import { Publisher, Subjects, TicketUpdatedEvent } from '@vmticketsapp/common';

export class TicketUpdatedPublisher extends Publisher<TicketUpdatedEvent> {
  readonly subject = Subjects.TicketUpdated;
}
