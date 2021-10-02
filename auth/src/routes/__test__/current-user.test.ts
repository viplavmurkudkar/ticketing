import request from 'supertest';
import { app } from '../../app';

//browsers and postman have functionality to auto manage cookies and send cookie data with any followup reqs to the server. However supertest by default does not manage cookies for us automatically.
it('responds with details about the current user', async () => {
  // const authResponse = await request(app)
  //   .post('/api/users/signup')
  //   .send({
  //     email: 'test@test.com',
  //     password: 'password',
  //   })
  //   .expect(201); // we do get a cookie back in this request but it isnt by default included in the followup req

  const cookie = await signin();

  const response = await request(app)
    .get('/api/users/currentuser')
    .set('Cookie', cookie) //used to set headers on request we make
    .send()
    .expect(200);

  expect(response.body.currentUser.email).toEqual('test@test.com');
});

it('responds with null if not authenticated', async () => {
  const response = await request(app)
    .get('/api/users/currentuser')
    .send()
    .expect(200);

  expect(response.body.currentUser).toEqual(null);
});
