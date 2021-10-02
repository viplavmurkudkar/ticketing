import 'bootstrap/dist/css/bootstrap.css';
import buildClient from '../api/build-client';
import Header from '../components/header';

//BTS whenever we try to navigate to some distinct pg with NextJS, Next imports the relevant compo(file name matches route name) from one of the files in the 'pages' dir. Next does not just take this compo and show it on screen. Instead it wraps it up inside of its own custom default compo referred to inside next as the 'app'. when we define this '_app.js' file we define our own custom app compo. so whenevr we try to visit out root route inside our proj(index.js), next imports that given compo and passes it into the app compo as the Component prop(which we destructure out below). pageProps is the set of components that we had been intending to pass our index.js compo. the reason we define this is because if we ever want to include some global CSS inside our proj(which bootstrap is), we can only import global CSS inside this app file. as we try to visit some other pgs/compos from our root route(index.js) Next does not load up/parse that index file. therefore any css we import in index is not included in the final html file. therefore if we have any global css that we want to include on every single page, it has to be imported into this app file because its the only file that is guaranteed to load up everytime a user comes to our app.
//can also be used to show some eles on screen that are visible on EVERY single page (like our HEADER)

const AppComponent = ({ Component, pageProps, currentUser }) => {
  return (
    <div>
      <Header currentUser={currentUser} />
      <div className="container">
        <Component currentUser={currentUser} {...pageProps} />
      </div>
    </div>
  );
}; //exporting a react component which receives a props obj

AppComponent.getInitialProps = async (appContext) => {
  const client = buildClient(appContext.ctx);
  const { data } = await client.get('/api/users/currentuser');
  //manually calling getInitialProps() of page compo since it is not called auto anymore
  let pageProps = {};
  if (appContext.Component.getInitialProps) {
    pageProps = await appContext.Component.getInitialProps(
      appContext.ctx,
      client,
      data.currentUser
    );
  }

  return {
    pageProps,
    ...data,
  };
}; //since we arent working inside a page but a custom app compo that wraps up a pg, the args provided to a getInitialProps() for the custom app compo are DIFF to the args provided to the getInitialProps() of a pg.
//context === {req, res} in pg
// context === {AppTree, Component, router, ctx:{req, res}}
// when we define a getInitialProps() for app compo, the getInitialProps() for individual components are not invoked automatically anymore. so if we have an getInitialProps() in index it wont be automatically invoked

export default AppComponent;
