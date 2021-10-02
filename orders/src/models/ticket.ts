import mongoose from 'mongoose';
import { updateIfCurrentPlugin } from 'mongoose-update-if-current';
import { Order, OrderStatus } from './order';

interface TicketAttrs {
  id: string;
  title: string;
  price: number;
}

export interface TicketDoc extends mongoose.Document {
  title: string;
  price: number;
  version: number;
  isReserved(): Promise<boolean>; //returns a promise that resolves with a boolean
}

interface TicketModel extends mongoose.Model<TicketDoc> {
  build(attrs: TicketAttrs): TicketDoc;
  findByEvent(event: {
    id: string;
    version: number;
  }): Promise<TicketDoc | null>;
}

const ticketSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
    min: 0,
  },
});

ticketSchema.set('toJSON', {
  transform(doc: any, ret: any) {
    ret.id = ret._id;
    delete ret._id;
  },
});

ticketSchema.set('versionKey', 'version');
ticketSchema.plugin(updateIfCurrentPlugin);

ticketSchema.statics.findByEvent = (event: { id: string; version: number }) => {
  return Ticket.findOne({
    _id: event.id,
    version: event.version - 1,
  });
};

ticketSchema.statics.build = (attrs: TicketAttrs) => {
  return new Ticket({
    _id: attrs.id,
    title: attrs.title,
    price: attrs.price,
  });
};
// statics obj is how we add a new mtd directly to the model itself(Ticket, which gives us access to the overall collection). to add a new mtd to each DOCUMENT we add the mtd to the SCHEMA.
ticketSchema.methods.isReserved = async function () {
  // this === the ticket document that we just called 'isReserved' on. thus we have to use a normal function instead of an arrow function here
  // Run query to look at all orders. Find an order where the ticket is the ticket we just found *AND* the order's status is *NOT* cancelled. if we find an order from this it means that the ticket *is* reserved
  const existingOrder = await Order.findOne({
    ticket: this.id,
    status: {
      $in: [
        OrderStatus.Created,
        OrderStatus.AwaitingPayment,
        OrderStatus.Complete,
      ],
    },
  });

  return !!existingOrder; //is existingOrder is null it is flipped to true due to first ! and flipped back to false by the 2nd one. vice versa if existingOrder is not null
};

const Ticket = mongoose.model<TicketDoc, TicketModel>('Ticket', ticketSchema);

export { Ticket };
