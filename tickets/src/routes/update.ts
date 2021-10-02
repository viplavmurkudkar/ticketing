import express, { Request, Response } from 'express';
import { body } from 'express-validator';
import {
  validateRequest,
  NotFoundError,
  requireAuth,
  NotAuthorizedError,
  BadRequestError,
} from '@vmticketsapp/common';

import { Ticket } from '../models/ticket';
import { TicketUpdatedPublisher } from '../events/publishers/ticket-updated-publisher';
import { natsWrapper } from '../nats-wrapper';

const router = express.Router();

router.put(
  '/api/tickets/:id',
  requireAuth,
  [
    body('title').not().isEmpty().withMessage('Title is required'),
    body('price')
      .isFloat({ gt: 0 })
      .withMessage('Price is required and must be greater than 0'),
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    const ticket = await Ticket.findById(req.params.id);

    if (!ticket) {
      throw new NotFoundError();
    }

    if (ticket.orderId) {
      //means ticket is reserved and we should prevent edits to the ticket
      throw new BadRequestError('Cannot edit a reserved ticket!');
    }

    if (ticket.userId !== req.currentUser!.id) {
      throw new NotAuthorizedError();
    }

    ticket.set({
      title: req.body.title,
      price: req.body.price,
    });
    await ticket.save(); //on calling save the updates are persisted to the db and mongoose makes sure that any further updates(due to post/pre save hooks or something done by Mongo) will be persisted BACK to this ticket doc that we have right now. therefore we do not have to refetch the ticket to get the updated ver. we already have the updated version.

    await new TicketUpdatedPublisher(natsWrapper.client).publish({
      id: ticket.id,
      version: ticket.version,
      title: ticket.title,
      price: ticket.price,
      userId: ticket.userId,
    }); //if we dont await this thing getting published, the next line runs immediately afterwards and a resp is sent back to user. if some error occurs in this step, we do not get an opportunity to tell the user that some err has occured

    res.send(ticket);
  }
);

export { router as updateTicketRouter };
