import { Publisher, OrderCreatedEvent, Subjects } from '@vmticketsapp/common';

export class OrderCreatedPublisher extends Publisher<OrderCreatedEvent> {
  readonly subject = Subjects.OrderCreated;
}
