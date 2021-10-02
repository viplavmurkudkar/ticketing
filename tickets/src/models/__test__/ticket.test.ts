import { Error } from 'mongoose';
import { Ticket } from '../ticket';

it('implements optimistic concurrency control', async () => {
  // Create an instance of a ticket
  const ticket = Ticket.build({
    title: 'concert',
    price: 5,
    userId: '123',
  });

  // Save the ticket to the db
  await ticket.save(); //mongoose/updateIfCurr plugin should have assigned a ver to this ticket

  // Fetch the ticket TWICE
  const firstInstance = await Ticket.findById(ticket.id);
  const secondInstance = await Ticket.findById(ticket.id);

  // Make 2 separate changes to the tickets we fetched
  firstInstance!.set({ price: 10 });
  secondInstance!.set({ price: 15 });

  // save the first fetched ticket.(should work as expected)
  await firstInstance!.save();

  // save the 2nd fetched ticket.(this thing shud have an outdated version no. because when we save the first ticket it will have incremented the ver in our db). so when we try to save this we should expect an err
  try {
    await secondInstance!.save();
  } catch (err) {
    return; //since we expect the above line of code to throw an err, we catch the err here and simply return from the test. if this behaviour happens it means our test has passed. if no error is thrown in try block, the catch block is never executed and we thus go on to the next line where we manually throw an err causing this test to fail.
  }

  throw new Error('Should not reach this point'); //if the test reaches this point it has failed.
});

it('increments the version number on multiple saves', async () => {
  const ticket = Ticket.build({
    title: 'concert',
    price: 20,
    userId: '123',
  });

  await ticket.save();
  expect(ticket.version).toEqual(0);
  await ticket.save(); //we dont have to update the rec for the version number to change. only saving it another time ALSO changes the version number.
  expect(ticket.version).toEqual(1);
  await ticket.save();
  expect(ticket.version).toEqual(2);
});
