import Link from 'next/link';

// we dont use use-request hook inside here bcoz we're making the req in getInitialProps and not inside a react component

//we get currentUser from our app compo(sent to every compo that is rendered) while we get tickets from LandingPage.getInitialProps below
const LandingPage = ({ currentUser, tickets }) => {
  const ticketList = tickets.map((ticket) => {
    return (
      <tr key={ticket.id}>
        <td>{ticket.title}</td>
        <td>{ticket.price}</td>
        <td>
          <Link href="/tickets/[ticketId]" as={`/tickets/${ticket.id}`}>
            <a>View</a>
          </Link>
        </td>
      </tr>
    );
  });

  return (
    <div>
      <h1>Tickets</h1>
      <table className="table">
        <thead>
          <tr>
            <th>Title</th>
            <th>Price</th>
            <th>Link</th>
          </tr>
        </thead>
        <tbody>{ticketList}</tbody>
      </table>
    </div>
  );
};

//1st arg to getInitialProps will be an obj with some props inside it. one of the props is req obj. req.headers will contain our cookie that we need to forward to ingress nginx when we make the axios req below
LandingPage.getInitialProps = async (context, client, currentUser) => {
  //we need to fig out whether we're in the browser or in the server(during SSR) so we can adjust the domain accordingly

  // if (typeof window === 'undefined') {
  //   //we are on server!
  //   //reqs shud be made to http://ingress-nginx-controller .....
  //   const { data } = await axios.get(
  //     'http://ingress-nginx-controller.ingress-nginx.svc.cluster.local/api/users/currentuser',
  //     {
  //       // headers: {
  //       //   Host: 'ticketing.dev', //since in our ingress-srv.yaml file this is the hostname we have defined. if we dont include this, ingress has no way of knowing our host and this req will result in a 404
  //       // },
  //       headers: req.headers, //we take headers from incoming req and pass all of them along to ingress nginx. by doing this we do not have to specify the Host as done above and also takes care of sending the cookie(the browser will do this auto by here we have to handle sending the cookie) to ingress-nginx
  //     }
  //   );

  //   return data;
  // } //window is an obj that ONLY exists inside the BROWSER. it does NOT exist inside of a node js env. so if window is undefined, this code is being executed on server
  // else {
  //   //we are on browser
  //   //reqs can be made with baseUrl of  ""
  //   const { data } = await axios.get('/api/users/currentuser');
  //   return data; // { currentUser: {} || null }
  // }
  const { data } = await client.get('/api/tickets');

  return { tickets: data };
}; //executed during server side rendering process. we fetch some data here specifically for some initial rendering. the data we return from this mtd shows up as props inside our compo. if we have to fetch some data for the server side rendering process, we have to do it inside here. once our app is executed inside browser, we dont care about this anymore. instead we fetch data as usual inside our compo

export default LandingPage;
