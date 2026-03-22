import { Response } from 'express';
import { AuthRequest } from '../../middlewares/auth';
import * as WalletService from './wallet.service';

export const getWallet = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const result = await WalletService.getWallet(
      req.params.walletId as string,
      req.user!.id,
    );
    res.status(200).json({ status: 'success', data: result });
  } catch (error: any) {
    res.status(error.status || 500).json({
      status: 'error',
      message: error.message || 'Internal server error',
    });
  }
};

export const fundWallet = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const result = await WalletService.fundWallet({
      walletId: req.params.walletId as string,
      userId: req.user!.id,
      amount: Number(req.body.amount),
    });
    res.status(200).json({ status: 'success', data: result });
  } catch (error: any) {
    res.status(error.status || 500).json({
      status: 'error',
      message: error.message || 'Internal server error',
    });
  }
};

export const transferFunds = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const result = await WalletService.transferFunds({
      walletId: req.params.walletId as string,
      userId: req.user!.id,
      recipientEmail: req.body.recipientEmail,
      amount: Number(req.body.amount),
      description: req.body.description,
    });
    res.status(200).json({ status: 'success', data: result });
  } catch (error: any) {
    res.status(error.status || 500).json({
      status: 'error',
      message: error.message || 'Internal server error',
    });
  }
};

export const withdrawFunds = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const result = await WalletService.withdrawFunds({
      walletId: req.params.walletId as string,
      userId: req.user!.id,
      amount: Number(req.body.amount),
    });
    res.status(200).json({ status: 'success', data: result });
  } catch (error: any) {
    res.status(error.status || 500).json({
      status: 'error',
      message: error.message || 'Internal server error',
    });
  }
};
