import { Message, Stan } from 'node-nats-streaming';
import { Subjects } from './subjects';

interface Event {
  subject: Subjects;
  data: any;
}

//<> we set Listener up as a generic class. whenever we try to make use of Listener(by extending it for eg), we have to provide some custom type to it. The generic type is like an arg for types. we can thus refer to type T everywhere inside our class def
export abstract class Listener<T extends Event> {
  abstract subject: T['subject']; //means that the subject provided must be equal to whatever subject was provided on this arg(Event interface)
  abstract queueGroupName: string;
  abstract onMessage(data: T['data'], msg: Message): void;
  private client: Stan;
  protected ackWait = 5 * 1000;

  constructor(client: Stan) {
    this.client = client;
  }

  subscriptionOptions() {
    return (
      this.client
        .subscriptionOptions()
        .setDeliverAllAvailable()
        //setting setDeliverAllAvailable() on subscriptionOptions ensures that whenever our subscription is created, NATS sends over ALL the events that we missed before the subscription was created/ while its been down. even with setting setDurableName() we still need to provide this opt since it ensures that when our subscription is created for the 1st time, NATS sends over all the events that the subscription has received. it does this only the first time. if the listener temp goes down and comes back up NATS will ensure that it only sends the events that the listener missed out on(this happens only when we create a durable sub)
        .setManualAckMode(true)
        .setAckWait(this.ackWait)
        .setDurableName(this.queueGroupName)
    ); // setDurableName() provides an identifier for the sub we are created and thus creates a Durable subscription. we do this to manage the prob created by adding setDeliverAllAvailable().
  }

  listen() {
    const subscription = this.client.subscribe(
      this.subject,
      this.queueGroupName,
      this.subscriptionOptions()
    ); //2nd arg is the name of the queue group we want to join. we do this when we want to run multiple instances of a service and not have all these instances receive an event when it is emitted(since it would lead to data duplication). Also another adv of creating a queue group is that NATS does not dump our durable sub anytime that sub temporarily goes down/restarts.

    subscription.on('message', (msg) => {
      //msg is not just the raw data emitted by publisher. its got a couple of diff extra props on it in addn to that
      console.log(`Message received: ${this.subject} / ${this.queueGroupName}`);

      const parsedData = this.parseMessage(msg);
      this.onMessage(parsedData, msg);
    });
  }

  parseMessage(msg: Message) {
    const data = msg.getData();
    return typeof data === 'string'
      ? JSON.parse(data)
      : JSON.parse(data.toString('utf-8')); //if the msg is a buffer instead of a string
  }
}
