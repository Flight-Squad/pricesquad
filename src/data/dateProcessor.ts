// TODO verb-alize this formatter

/**
 * Take ISO String (from `date`) like `'2011-10-05T14:48:00.000Z'`
 *
 * and turn it into `'2011-10-05'`
 * @param date
 */
export function formatDateAsKebab(date: Date) {
  // split on 'T' and return first element string array
  return date.toISOString().split('T')[0]
}

export function convertHrTimeToNanos(time: [number, number]) {
  const secToNanos = 1000 * 1000 * 1000;
  const total = time[0] * secToNanos + time[1];
  return total;
}

// Keeping these commented out to move into tests later
// expected output: yyyy-mm-dd
// console.log(dateFormat.googleFlights(new Date()));

