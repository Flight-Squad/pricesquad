import { Router } from 'express';
import { DB } from 'config/database';
import {
    Transaction,
    CreateTransactionFields,
    Customer,
    TransactionStatus,
    Plaid,
    Stripe,
    PaymentFields,
} from '@flight-squad/admin';
import StatusCodes from './config/statusCodes';
import { makePaymentUrl } from 'config/flightsquad';
import { PlaidClient, StripeClient } from 'config/payment';
import logger from 'config/logger';

const transactionsRouter = Router();

const cardMarkup = amt => amt * 1.02;

const toStripeAmount = (amount: number, currency: 'usd'): number => {
    const toInt = (num: number) => parseInt(num.toFixed(0));
    switch (currency) {
        case 'usd':
            return toInt(amount * 100); // to cents
        default:
            logger.warn('Currency Conversion not explicitly supported', { currency });
            return amount;
    }
};

transactionsRouter.get('/:id', async (req, res) => {
    const { id } = req.params;
    const transaction = await Transaction.find(DB, id);
    const responseData = transaction.data();
    // To avoid exposing the original search provider of the trip to the frontend
    const { provider, ...prunedTrip } = transaction.trip;
    responseData.trip = prunedTrip;
    res.send(JSON.stringify(responseData));
});

/**
 * Database: 1 Read, 1 Write
 *
 * Takes `CreateTransactionFields` as request body.
 *
 * Responds with:
 *
 * - transaction: TransactionFields
 * - paymentUrl: url where customer can pay
 */
transactionsRouter.post('/', async (req, res) => {
    const fields: CreateTransactionFields = req.body;
    const customer = await Customer.find(DB, fields.customer);
    let transaction = new Transaction({
        status: TransactionStatus.Created,
        customer: customer.identifiers(),
        id: '', // ID will be autogenerated when db entry is created, so leave empty
        trip: fields.trip,
        amount: fields.amount,
        db: DB,
    });
    transaction = await transaction.createDoc();
    res.status(StatusCodes.Post.success).send(
        JSON.stringify({
            transaction: transaction.data(),
            url: makePaymentUrl(transaction.id),
        }),
    );
});

/**
 * Database: 1-2 reads (2 if new customer), 0-1 writes (1 if new customer)
 */
transactionsRouter.post('/bank/pay', async (req, res) => {
    try {
        const { public_token, account_id, txId, passengerCount } = req.body;
        const bankToken = await Plaid.toStripe(
            await Plaid.getAccessToken(public_token, PlaidClient),
            account_id,
            PlaidClient,
        );
        const transaction = await Transaction.find(DB, txId);
        logger.info('Bank Pay Customer', transaction.customer);
        let stripeCustomerId = transaction.customer.stripe;
        if (stripeCustomerId) {
            await Stripe.updateDefaultSource(stripeCustomerId, bankToken, StripeClient);
        } else {
            const stripeCustomer = await Stripe.createCustomer(transaction.customer, StripeClient, {
                source: bankToken,
            });
            stripeCustomerId = stripeCustomer.id;

            // Update customer with stripe customer id
            const customer = await Customer.find(DB, transaction.customer.id);
            await customer.updateDoc({ stripe: stripeCustomerId }, Customer);
        }

        const charge = await Stripe.charge(
            {
                amount: toStripeAmount(transaction.amount * parseInt(passengerCount), 'usd'),
                customer: stripeCustomerId,
            },
            StripeClient,
        );
        logger.info('Stripe Bank Charge', charge);
        res.sendStatus(StatusCodes.Post.success);
    } catch (e) {
        logger.error(e.name, { msg: e.message, stack: e.stack });
        res.sendStatus(500);
    }
});

transactionsRouter.post('/card/pay', async (req, res) => {
    try {
        const { txId, card_token, passengerCount } = req.body;
        const tx = await Transaction.find(DB, txId);
        logger.info('Card Pay Customer', tx.customer);
        let stripeCustomerId = tx.customer.stripe;

        if (!stripeCustomerId) {
            const stripeCustomer = await Stripe.createCustomer(tx.customer, StripeClient);
            stripeCustomerId = stripeCustomer.id;
            // Update customer with stripe customer id
            const customer = await Customer.find(DB, tx.customer.id);
            await customer.updateDoc({ stripe: stripeCustomerId }, Customer);
        }

        const charge = await Stripe.charge(
            {
                amount: toStripeAmount(cardMarkup(tx.amount) * parseInt(passengerCount), 'usd'),
                source: card_token,
            },
            StripeClient,
        );
        logger.info('Stripe Card Charge', charge);
        res.sendStatus(StatusCodes.Post.success);
    } catch (e) {
        logger.error(e.name, { msg: e.message, stack: e.stack });
        res.sendStatus(500);
    }
});

export default transactionsRouter;
