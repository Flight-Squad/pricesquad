import { skiplaggedFlights } from "./skiplagged";
import { googleFlights } from "./googleFlights";

skiplaggedFlights().then(res => {
  console.log('SkipLagged:')
  console.log(res.data);
  console.log(res.time);
})
googleFlights().then(res => {
  console.log('GoogleFlights:')
  console.log(res.data);
  console.log(res.time);
})
