import mongoose from 'mongoose';

import { app } from './app';

const start = async () => {
  console.log('Starting up!');
  if (!process.env.JWT_KEY) {
    throw new Error('JWT_KEY must be defined');
  } //TS never assumes a env var is defined so if we don't do this check it will gives us an error when we try to access JWT_KEY
  if (!process.env.MONGO_URI) {
    throw new Error('MONGO_URI must be defined');
  }

  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
    }); //auth is the name of the db. if none exists mongo creates a new one for us
    console.log('Connected to MongoDB');
  } catch (err) {
    console.error(err);
  }

  app.listen(3000, () => {
    console.log('listening on port 3000!');
  });
};

start();
