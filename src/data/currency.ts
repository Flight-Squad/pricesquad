export function parseLocaleNumber(
  stringNumber: string,
  locale: string,
  options?: any
) {
  // https://stackoverflow.com/a/42213804
  const numFormatter = makeNumFormatter(locale, options);
  var thousandSeparator = numFormatter.format(1111).replace(/1/g, "");
  var decimalSeparator = numFormatter.format(1.1).replace(/1/g, "");

  console.log(thousandSeparator);
  console.log(decimalSeparator);

  return parseFloat(
    stringNumber
      .replace(new RegExp("\\" + thousandSeparator, "g"), "")
      .replace(new RegExp("\\" + decimalSeparator), ".")
  );
}

// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/NumberFormat/format
function makeNumFormatter(locale: string, options?: any) {
  if (options) {
    return new Intl.NumberFormat(locale, options);
  }
  return new Intl.NumberFormat(locale);
}

console.log(parseLocaleNumber("$123", "en-US"));
