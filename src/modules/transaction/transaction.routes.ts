import { Router } from 'express';
import * as TransactionController from './transaction.controller';
import { authenticate } from '../../middlewares/auth';

const router = Router();

router.use(authenticate);

router.get('/:wallet_id/transactions', TransactionController.getTransactions);

export default router;
