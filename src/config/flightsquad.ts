export const PaymentPageRoute = process.env.PAYMENT_PAGE;
export const makePaymentUrl = (id: string): string => `${PaymentPageRoute}?id=${id}`;