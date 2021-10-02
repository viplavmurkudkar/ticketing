import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import request from 'supertest';

import { app } from '../app';

//code to let TS know that a signin() does exist on the global scope
declare global {
  var signin: () => Promise<string[]>; //implies that signin() returns a promise that will resolve itself with value of type array of strings
}

//before any tests start up we create a new instance of MongoServer. starts up copy of mongo in mem. this allows us to run multiple diff tests at the same time across different projs without them all trying to reach same copy of mongo

let mongo: any;
//Hook function. whatever we pass into beforeAll() is run before all of our tests are executed
beforeAll(async () => {
  process.env.JWT_KEY = 'asdf';

  mongo = await MongoMemoryServer.create();
  const mongoUri = await mongo.getUri();

  await mongoose.connect(mongoUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
});

//another hook that runs before EACH of our tests
beforeEach(async () => {
  //here we reach into our mongodb db and delete all the data inside it
  const collections = await mongoose.connection.db.collections(); //gets us all the diff collections that exist

  for (let collection of collections) {
    await collection.deleteMany({});
  }
});

afterAll(async () => {
  //we stop the mongo server and disconnect mongoose from it
  await mongo.stop();
  await mongoose.connection.close();
});

//a global function. its a function assigned to the gloabal scope so we can easily use it from all of our test files. since we define it in this file, this function is only available in our test env
global.signin = async () => {
  const email = 'test@test.com';
  const password = 'password';

  const response = await request(app)
    .post('/api/users/signup')
    .send({
      email,
      password,
    })
    .expect(201);

  const cookie = response.get('Set-Cookie');

  return cookie;
};
