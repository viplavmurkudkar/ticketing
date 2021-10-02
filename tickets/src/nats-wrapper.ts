import nats, { Stan } from 'node-nats-streaming';

class NatsWrapper {
  private _client?: Stan; //we do not define this prop in a constructor bcoz we are running the constructor below and at that point it is too early to try to create an actual NATS client and assign it to _client. we do not want to create and assign this prop until we eventually try to do it inside index.ts when we do this TS gives us an err. to solve this we add '?' after the prop to tell TS that this prop maybe undefined for some period of time

  get client() {
    if (!this._client) {
      throw new Error('Cannot access NATS Client before connecting');
    }

    return this._client;
  } //getter for client. while calling getter we do client not client()

  connect(clusterId: string, clientId: string, url: string) {
    this._client = nats.connect(clusterId, clientId, { url });

    return new Promise<void>((resolve, reject) => {
      this.client.on('connect', () => {
        console.log('Connected to NATS');
        resolve();
      });
      this.client.on('error', (err) => {
        reject(err);
      });
    });
  } //we call connect from index.ts with our conn settings. this receives the cluster id, client id(that we want to name ourselves as) and the url to try to connect to.
}

export const natsWrapper = new NatsWrapper();
