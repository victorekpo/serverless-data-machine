export const handler = async () => {
  console.log("Canceling flights..");

  return {
    status: "ok",
    booking_id: "Flight canceled"
  } ;
}