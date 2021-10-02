import { Subjects } from './subjects';

//Created to enforce tight coupling between subject/channel name and the data that a listener listening/subscribed on that channel will receive. in our app for a particular channel the data emitted is consistent

export interface TicketCreatedEvent {
  subject: Subjects.TicketCreated;
  data: {
    id: string;
    title: string;
    price: number;
  };
}
