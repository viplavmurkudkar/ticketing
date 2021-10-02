import Stripe from 'stripe';

// Stripe above is a class. we create a instance of it below and export it so it can be used anywhere inside our app

export const stripe = new Stripe(process.env.STRIPE_KEY!, {
  apiVersion: '2020-08-27',
});
