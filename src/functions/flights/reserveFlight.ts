export const handler = async () => {
  console.log("Reserving flights..");

  return {
    status: "ok",
    booking_id: "Flight reserved"
  } ;
}