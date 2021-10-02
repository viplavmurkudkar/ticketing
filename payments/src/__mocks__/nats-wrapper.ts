// to fake the behaviour of natsWrapper we essentially just export a obj from this file
export const natsWrapper = {
  client: {
    publish: jest
      .fn()
      .mockImplementation(
        (subject: string, data: string, callback: () => void) => {
          callback();
        }
      ), //creating a mock function. essentially creates a fake function that allows us to make tests/expectations around it. we expect that a mock function gets executed with some particular arg. jest.fn() returns a new function that we assign to prop of publish. it can be called from anywhere inside our app and it internally keeps track of whether or not it has been called, what args it has been provided so we can make some expectations about it. we still need to invoke the callback function that is passed when our publisher calls publish() on our client. so just jest.fn() wont work. to implement both together we add mockImplementation() to fn(). the function we pass into mockImplementation is the one that will then be executed when someone calls publish(). the keeping track of whether or not it has been called stuff still works with this

    // publish: (subject: string, data: string, callback: () => void) => {
    //   callback();
    // },
  },
};
