export const handler = async () => {
  console.log("Canceling rentals..");

  return {
    status: "ok",
    booking_id: "Rental canceled"
  } ;
}