// Next js can be a bit finicky in detecting file changes when it is running inside a pod in a k cluster. to take care of this prob we create this file.
// This file is loaded up automatically by NextJs whenever our proj starts up. it takes a look at the webpackDevMiddleware function and calls it with some config that it has created by default. we change a single option on there to tell webpack that rather than watch for file changes in some automated fashion instead pull all the diff files inside of our proj dir automatically once every 300 ms

module.exports = {
  webpackDevMiddleware: (config) => {
    config.watchOptions.poll = 300;
    return config;
  },
};
