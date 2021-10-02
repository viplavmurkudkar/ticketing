import { Subjects, Publisher, PaymentCreatedEvent } from '@vmticketsapp/common';

export class PaymentCreatedPublisher extends Publisher<PaymentCreatedEvent> {
  readonly subject = Subjects.PaymentCreated;
}
