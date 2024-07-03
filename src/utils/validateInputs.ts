import { SagaLambdaEvent } from '../functions/sagaLambda';

type SagaLambdaInputs = SagaLambdaEvent['queryStringParameters'];

export const validateInputs = (inputs: SagaLambdaInputs, requestId: string, runType: string) => {
  const { departCity, departTime, arriveCity, arriveTime, rental, rentalFrom, rentalTo } = inputs;

  // use zod to validate inputs here

  return {
    departCity,
    departTime,
    arriveCity,
    arriveTime,
    rental,
    rentalFrom,
    rentalTo,
    requestId,
    runType
  };
};