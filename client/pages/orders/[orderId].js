import { useEffect, useState } from 'react';
import StripeCheckout from 'react-stripe-checkout';
import Router from 'next/router';
import useRequest from '../../hooks/use-request';

const OrderShow = ({ order, currentUser }) => {
  const [timeLeft, setTimeLeft] = useState(0);
  const { doRequest, errors } = useRequest({
    url: '/api/payments',
    method: 'post',
    body: {
      orderId: order.id,
    },
    onSuccess: (payment) => Router.push('/orders'),
  });

  useEffect(() => {
    const findTimeLeft = () => {
      const msLeft = new Date(order.expiresAt) - new Date();
      setTimeLeft(Math.round(msLeft / 1000));
    };

    findTimeLeft(); //setInterval will wait 1000 ms to run findTimeLeft for the 1st time. to avoid waiting a sec we manually invoke the funcn here
    const timerId = setInterval(findTimeLeft, 1000); //calls findTimeLeft once every second. also we just pass a ref to findTimeLeft and dont actually call it. if we call it, setInterval will call the result of that call every sec which is not what we want

    return () => {
      clearInterval(timerId);
    }; // when we return a funcn from useEffect, it is invoked anytime we navigate away from our compo or if it rerenders(not in this case since we have [])
  }, [order]); //we only want to setup the interval funcn only once

  if (timeLeft < 0) {
    return <div>Order Expired</div>;
  }

  return (
    <div>
      Time left to pay: {timeLeft} seconds
      <StripeCheckout
        token={({ id }) => doRequest({ token: id })}
        stripeKey="pk_test_51JeLYGCLTIVy6PpaFMYrHzirZRZjjvEWPlTvDaukXEsEyhZ93LL9yZZGokYhM0lGxRaUMDat8tCdTK895nXha342000TPbDzrx"
        amount={order.ticket.price * 100}
        email={currentUser.email}
      />
      {errors}
    </div>
  );
};

OrderShow.getInitialProps = async (context, client) => {
  const { orderId } = context.query;
  const { data } = await client.get(`/api/orders/${orderId}`);

  return { order: data };
};

export default OrderShow;
