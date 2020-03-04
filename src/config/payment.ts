import plaid from 'plaid';
import { Plaid, PlaidClientConfig, Stripe } from '@flight-squad/admin';

const plaidConfig: PlaidClientConfig = {
    clientId: process.env.PLAID_CLIENT_ID,
    secret: process.env.PLAID_SECRET,
    environment: plaid.environments[process.env.PLAID_ENV],
    publicKey: process.env.PLAID_PUBLIC_KEY,
}

export const PlaidClient = Plaid.client(plaidConfig);

export const StripeClient = Stripe.client(process.env.STRIPE_SECRET_KEY);