import express, { Request, Response } from 'express';
import { body } from 'express-validator';
import jwt from 'jsonwebtoken';
import { validateRequest, BadRequestError } from '@vmticketsapp/common';

import { User } from '../models/user';

const router = express.Router();

router.post(
  '/api/users/signup',
  [
    body('email').isEmail().withMessage('Invalid Email!'),
    body('password')
      .trim() //sanitisation step to remove any leading or trailing spaces
      .isLength({ min: 4, max: 20 })
      .withMessage('Password must be between 4 and 20 characters!'),
  ], //if anything wrong with req, above funcns append some props on the req obj
  validateRequest,
  async (req: Request, res: Response) => {
    const { email, password } = req.body;

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      throw new BadRequestError('Email already in use');
    }

    const user = User.build({ email, password });
    await user.save();

    // Generate JWT
    const userJwt = jwt.sign(
      {
        id: user.id, //Mongo id
        email: user.email,
      },
      process.env.JWT_KEY! //'!' tells TS that we already checked to see that the env var was defined. so the err goes away
    );

    //Store it on session object
    req.session = {
      jwt: userJwt,
    }; //since doing req.session.jwt = userJwt gives an err from TS(type def file does not want us to assume that there's and obj on req.session), we redefine the entire object and set it on req.session

    res.status(201).send(user);
  }
);

export { router as signupRouter };
