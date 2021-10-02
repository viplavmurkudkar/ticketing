import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import request from 'supertest';
import jwt from 'jsonwebtoken';

import { app } from '../app';

//code to let TS know that a signin() does exist on the global scope
declare global {
  var signin: () => string[];
}

// tells Jest to make use of our mock nats-wrapper file.
jest.mock('../nats-wrapper'); //we pass in the relative path to the file we want to fake(not the one in __mocks__). ensures ALL the diff tests in our app use the mock ver of nats-wrapper. Defining it here enables us to not define this line in every test file.

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
  jest.clearAllMocks(); //the mock funcn in nats-wrapper(__mocks__ one) will be reused for every single one of our tests. between each test we want to reset this mock function since it internally records how many times it is called, args it is called with etc. so we do not want to pollute a test with data from 10 other tests
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
global.signin = () => {
  // Build a JWT payload. { id, email }
  const payload = {
    id: new mongoose.Types.ObjectId().toHexString(), //to randomly generate an id when signin() is called
    email: 'test@test.com',
  };

  // Create the JWT!
  const token = jwt.sign(payload, process.env.JWT_KEY!);

  // Build session obj. { jwt: MY_JWT }
  const session = { jwt: token };

  // Turn that session into JSON
  const sessionJSON = JSON.stringify(session);

  // Take JSON and encode it as base64
  const base64 = Buffer.from(sessionJSON).toString('base64');

  // return a string thats the cookie with the encoded data
  return [`express:sess=${base64}`];
};
