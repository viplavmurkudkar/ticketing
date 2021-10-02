import Queue from 'bull';
import { ExpirationCompletePublisher } from '../events/publishers/expiration-complete-publisher';
import { natsWrapper } from '../nats-wrapper';

interface Payload {
  orderId: string;
}

// we can also create a interface that describes the data that we are going to put into the jobs that we send over this queue
const expirationQueue = new Queue<Payload>('order:expiration', {
  redis: {
    host: process.env.REDIS_HOST,
  },
}); //1st arg is the type/channel which is like a bucket in redis server where we want to store the job in temporarily. 2nd arg is the options obj. we tell the queue to connect to our instance of redis server in this obj

expirationQueue.process(async (job) => {
  // receiving a job to process here implies that the 15 mins delay is complete meaning that the order has expired. thus we emit an expiration:complete event from here
  //the job we receive here doesnt just have the payload we sent. it also has a no of other props. our payload is present on the data prop inside job

  new ExpirationCompletePublisher(natsWrapper.client).publish({
    orderId: job.data.orderId,
  });
});

export { expirationQueue };
