export const handler = async () => {
  console.log('Processing payment..');

  return {
    status: 'ok',
    booking_id: 'Payment processed'
  } ;
};