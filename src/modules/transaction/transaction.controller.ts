import { Response } from 'express';
import { AuthRequest } from '../../middlewares/auth';
import * as TransactionService from './transaction.service';

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 20;

export const getTransactions = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const page = Math.max(
      1,
      parseInt(req.query.page as string) || DEFAULT_PAGE,
    );
    const limit = Math.min(
      100,
      Math.max(1, parseInt(req.query.limit as string) || DEFAULT_LIMIT),
    );

    const result = await TransactionService.getTransactionsByWallet(
      req.params.wallet_id as string,
      req.user!.id,
      { page, limit },
    );

    res.status(200).json({ status: 'success', data: result });
  } catch (error: any) {
    res
      .status(error.status || 500)
      .json({
        status: 'error',
        message: error.message || 'Internal server error',
      });
  }
};
