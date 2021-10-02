import { useEffect } from 'react';
import { useRouter } from 'next/router';

import useRequest from '../../hooks/use-request';

//for signout to work properly we need to make the req to '/api/users/signout' from our component and NOT from getInitialProps since that would not work properly since our server does'nt care about cookies. so we have to make the req from the Browser!!!

const Signout = () => {
  const router = useRouter();
  const { doRequest } = useRequest({
    url: '/api/users/signout',
    method: 'post',
    body: {},
    onSuccess: () => router.push('/'),
  });

  useEffect(() => {
    doRequest();
  }, []);

  return <div>Signing you out...</div>;
};

export default Signout;
