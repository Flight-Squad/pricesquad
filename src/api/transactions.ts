import { Router } from 'express';
import { DB } from 'config/database';
import { Transaction, Firebase } from '@flight-squad/admin';

const transactionsRouter = Router();

transactionsRouter.get('/:id', async (req, res) => {
    const { id } = req.params;
    const transaction = await DB.find(Firebase.Collections.Transactions, id, Transaction);
    res.send(JSON.stringify(transaction.data()));
});

transactionsRouter.post('/', async (req, res) => {});

export default transactionsRouter;
