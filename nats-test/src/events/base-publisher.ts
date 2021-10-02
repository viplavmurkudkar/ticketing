import { Stan } from 'node-nats-streaming';
import { Subjects } from './subjects';

interface Event {
  subject: Subjects;
  data: any;
}

export abstract class Publisher<T extends Event> {
  abstract subject: T['subject'];
  private client: Stan;

  constructor(client: Stan) {
    this.client = client;
  }

  publish(data: T['data']): Promise<void> {
    //publishing an event to NATS SS is an async op. the node nats streaming lib makes a req, publish the event and get some confirmation that the event was actually published. therefore when we call publish() from one of our publishers(that we will create by extending this class) we will mostly require to wait for the event to be published before doing something else in our code. so essentially we want to do:
    // await publisher.publish(data) in our custom publisher
    // to use async await we need to return a promise from publish(). we resolve and reject the promise ourselves.
    return new Promise((resolve, reject) => {
      this.client.publish(this.subject, JSON.stringify(data), (err) => {
        if (err) {
          return reject(err);
        }
        console.log('Event published to subject:', this.subject);
        resolve();
      }); //1st arg is the subj/channel name. 3rd arg(this is opt) is a cb funcn which is invoked after we publish the data. the 1st arg to the cb is the err obj. it is null is no error has occured
    });
  }
}
