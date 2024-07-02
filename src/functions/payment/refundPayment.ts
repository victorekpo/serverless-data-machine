export const handler = async () => {
  console.log('Refunding payment..');

  return {
    status: 'ok',
    booking_id: 'Payment refunded'
  } ;
};