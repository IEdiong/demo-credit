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

router.get('/:walletId', WalletController.getWallet);
router.post('/:walletId/fund', validateFund, WalletController.fundWallet);
router.post(
  '/:walletId/transfer',
  validateTransfer,
  WalletController.transferFunds,
);
router.post(
  '/:walletId/withdraw',
  validateWithdraw,
  WalletController.withdrawFunds,
);

export default router;
