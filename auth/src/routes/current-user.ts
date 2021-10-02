//Our react app may need to fig out if a user is signed into our app. the react app cannot directly look at the cookie and fig out if theres a valid jwt in there(since we have setup our cookies in such a way that they cannot be accessed by JS running in the browser). so react app needs to make a request somewhere in our app to fig out if the user is signed in. thats the goal of this route handler. the req to this route will include a cookie IF IT EXISTS(ie if the user is logged in it will be present.). if the user is not logged in there will be no cookie. If req.session.jwt is not set(no cookie) or if JWT is invalid we return {currentUser: null}. If it is set and JWT is valid we send back the payload from the JWT
import express from 'express';

import { currentUser } from '@vmticketsapp/common';

const router = express.Router();

router.get('/api/users/currentUser', currentUser, (req, res) => {
  res.send({ currentUser: req.currentUser || null });
});

export { router as currentUserRouter };
