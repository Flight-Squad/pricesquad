export interface IPriceRequestQuery {
  origin: string;
  dest: string;
  departDate: string;
  returnDate?: string;
  isRoundTrip: boolean;
  numStops: FlightStops;
}

export async function validatePriceRequestQueryParams(params: IPriceRequestQuery) {
  if (!(params.origin.trim() && params.dest.trim()) ||
  // naiive validation on existing code
   (params.origin.length < 3 || params.dest.length < 3)) {
    throw new Error('origin and dest must be proper codes')
  }

  if (!params.departDate) throw new Error('No depart Date provided');
  if (params.isRoundTrip) {
    if (!params.returnDate) throw new Error('No return date provided (trip is a round trip)')
  }
}

export interface IFlightSearchParams {
  origin: string;
  dest: string;
  departDate: Date;
  returnDate?: Date;
  isRoundTrip: boolean;
  numStops: FlightStops;
}

export enum FlightStops {
  NonStop,
  OneStop,
  AnyStops
}

export async function validateFlightSearchParams(params: IFlightSearchParams) {
  // orig and dest must be non empty and conform to existing airport/region code
  if (!(params.origin.trim() && params.dest.trim()) ||
  // naiive validation on existing code
   (params.origin.length < 3 || params.dest.length < 3)) {
    throw new Error('origin and dest must be proper codes')
  }
  // If is round trip, must have return date later than depart date
  // use moment
}

/**
 * Takes request data and processes it for easier use with controllers
 *
 * @param data
 */
export function makeFlightSearchParams(data: any): IFlightSearchParams {
  const params: any = {
    origin: data.origin,
    dest: data.dest,
    departDate: new Date(data.departDate),
    isRoundTrip: data.isRoundTrip,
    numStops: data.numStops
  };

  if (data.returnDate) {
    params.returnDate = new Date(data.returnDate);
  }

  return params;
}
