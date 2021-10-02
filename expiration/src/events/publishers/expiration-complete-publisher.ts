import {
  Publisher,
  ExpirationCompleteEvent,
  Subjects,
} from '@vmticketsapp/common';

export class ExpirationCompletePublisher extends Publisher<ExpirationCompleteEvent> {
  readonly subject = Subjects.ExpirationComplete;
}
