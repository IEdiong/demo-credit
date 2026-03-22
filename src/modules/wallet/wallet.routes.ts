import { Router } from 'express';
import * as WalletController from './wallet.controller';
import {
  validateFund,
  validateTransfer,
  validateWithdraw,
} from './wallet.validator';
import { authenticate } from '../../middlewares/auth';

const router = Router();

router.use(authenticate);

router.get('/:wallet_id', WalletController.getWallet);
router.post('/:wallet_id/fund', validateFund, WalletController.fundWallet);
router.post(
  '/:wallet_id/transfer',
  validateTransfer,
  WalletController.transferFunds,
);
router.post(
  '/:wallet_id/withdraw',
  validateWithdraw,
  WalletController.withdrawFunds,
);

export default router;
