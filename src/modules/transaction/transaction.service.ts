import db from '../../database/knex';
import { uuidToBinary, binaryToUUID } from '../../utils/uuid';

interface PaginationParams {
  page: number;
  limit: number;
}

interface PaginatedTransactions {
  results: object[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
  };
}

export const getTransactionsByWallet = async (
  walletId: string,
  userId: string,
  { page, limit }: PaginationParams,
): Promise<PaginatedTransactions> => {
  const wallet = await db('wallets')
    .where({ id: uuidToBinary(walletId) })
    .first();

  if (!wallet) {
    throw { status: 404, message: 'Wallet not found' };
  }

  if (binaryToUUID(wallet.user_id) !== userId) {
    throw { status: 403, message: 'You do not have access to this wallet' };
  }

  const offset = (page - 1) * limit;

  const [transactions, countResult] = await Promise.all([
    db('transactions')
      .where({ wallet_id: uuidToBinary(walletId) })
      .orderBy('created_at', 'desc')
      .limit(limit)
      .offset(offset),

    db('transactions')
      .where({ wallet_id: uuidToBinary(walletId) })
      .count('id as total')
      .first(),
  ]);

  const total = Number(countResult?.total ?? 0);

  return {
    results: transactions.map((tx: any) => ({
      id: binaryToUUID(tx.id),
      walletId: binaryToUUID(tx.wallet_id),
      type: tx.type,
      amount: Number(tx.amount),
      reference: tx.reference,
      description: tx.description,
      createdAt: tx.created_at,
    })),
    pagination: {
      page,
      limit,
      total,
      total_pages: Math.ceil(total / limit),
    },
  };
};
