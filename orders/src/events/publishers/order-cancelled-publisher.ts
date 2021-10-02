import { Publisher, OrderCancelledEvent, Subjects } from '@vmticketsapp/common';

export class OrderCancelledPublisher extends Publisher<OrderCancelledEvent> {
  readonly subject = Subjects.OrderCancelled;
}
