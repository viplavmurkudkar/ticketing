import axios from 'axios';

const buildClient = ({ req }) => {
  if (typeof window === 'undefined') {
    //we are on server!
    return axios.create({
      baseURL:
        'http://ingress-nginx-controller.ingress-nginx.svc.cluster.local',
      headers: req.headers,
    });
  } //window is an obj that ONLY exists inside the BROWSER. it does NOT exist inside of a node js env. so if window is undefined, this code is being executed on server
  else {
    //we are on browser
    //reqs can be made with baseUrl of  ""
    return axios.create({
      baseURL: '/',
    });
  }
};

export default buildClient;
