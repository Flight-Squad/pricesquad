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

export function validateFlightSearchParams(params: IFlightSearchParams) {
  // orig and dest must be non empty and conform to existing airport/region code
  if (!(params.origin.trim() && params.dest.trim()) ||
  // naiive validation on existing code
   (params.origin.length < 3 || params.dest.length < 3)) {
    throw new Error('origin and dest must be proper codes')
  }
  // If is round trip, must have return date later than depart date
  // use moment
}
