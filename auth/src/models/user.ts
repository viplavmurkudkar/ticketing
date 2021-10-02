import mongoose from 'mongoose';
import { Password } from '../services/password';

// An interface that describes the props that are required to create a new User
interface UserAttrs {
  email: string;
  password: string;
}

// An interface that describes the props that a User model has. We use this to tell TS that there's a build() available on the User model.
interface UserModel extends mongoose.Model<UserDoc> {
  build(attrs: UserAttrs): UserDoc;
}

// An interface that describes the props that a User DOCUMENT has since a User document can also have additional properties other than the ones provided when creating a new User(like createdAt, updatedAt etc)
interface UserDoc extends mongoose.Document {
  email: string;
  password: string;
}

const userSchema = new mongoose.Schema({
  email: {
    type: String, //refers to built in String constructor present in JS therfore String and not string(in TS)
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
});

userSchema.set('toJSON', {
  transform(doc: any, ret: any) {
    //doc is the actual user doc, ret is the thing that is eventually turned into JSON
    //we make direct changes to ret since its what is turned into JSON. do not return it or anything
    ret.id = ret._id;
    delete ret._id;
    delete ret.password; //normal JS. delete removes props from an obj.
    delete ret.__v;
  }, //we define props here which help mongoose take our doc and turn it into JSON
});

userSchema.pre('save', async function (done) {
  if (this.isModified('password')) {
    const hashed = await Password.toHash(this.get('password'));
    this.set('password', hashed);
  }
  done();
});

//adding a custom mtd to our model
userSchema.statics.build = (attrs: UserAttrs) => {
  return new User(attrs);
}; //anytime we want to create a new User we call 'new User.build()' instead of 'new User()'. we do this to enable TS to do type checking and make sure we are passing the correct attributes everytime we create a new user

const User = mongoose.model<UserDoc, UserModel>('User', userSchema); // passing UserModel as the 2nd generic type arg indicates that the model() will return type UserModel(refer to model() type def)

export { User };
