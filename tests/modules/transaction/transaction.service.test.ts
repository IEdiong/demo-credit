import * as TransactionService from '../../../src/modules/transaction/transaction.service';
import { uuidv7 } from 'uuidv7';
import { uuidToBinary } from '../../../src/utils/uuid';

jest.mock('../../../src/database/knex', () => {
  const mockDb: any = jest.fn();
  return { __esModule: true, default: mockDb };
});

import db from '../../../src/database/knex';
const mockDb = db as jest.MockedFunction<any>;

const userId = uuidv7();
const walletId = uuidv7();
const differentUserId = uuidv7();

const mockWallet = {
  id: uuidToBinary(walletId),
  user_id: uuidToBinary(userId),
  balance: '1000.00',
  created_at: new Date(),
};

const mockTransactions = [
  {
    id: uuidToBinary(uuidv7()),
    wallet_id: uuidToBinary(walletId),
    type: 'credit',
    amount: '500.00',
    reference: 'TXN-ABC123',
    description: 'Wallet funded',
    created_at: new Date(),
  },
  {
    id: uuidToBinary(uuidv7()),
    wallet_id: uuidToBinary(walletId),
    type: 'debit',
    amount: '200.00',
    reference: 'TXN-DEF456',
    description: 'Wallet withdrawal',
    created_at: new Date(),
  },
];

const pagination = { page: 1, limit: 20 };

describe('TransactionService - getTransactionsByWallet', () => {
  beforeEach(() => jest.clearAllMocks());

  it('should return paginated transactions for a valid wallet owner', async () => {
    mockDb
      .mockReturnValueOnce({
        where: jest.fn().mockReturnThis(),
        first: jest.fn().mockResolvedValue(mockWallet),
      })
      .mockReturnValueOnce({
        where: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        offset: jest.fn().mockResolvedValue(mockTransactions),
      })
      .mockReturnValueOnce({
        where: jest.fn().mockReturnThis(),
        count: jest.fn().mockReturnThis(),
        first: jest.fn().mockResolvedValue({ total: 2 }),
      });

    const result = await TransactionService.getTransactionsByWallet(
      walletId,
      userId,
      pagination,
    );

    expect(result.results).toHaveLength(2);
    expect(result.pagination.total).toBe(2);
    expect(result.pagination.total_pages).toBe(1);
    expect(result.pagination.page).toBe(1);
    expect(result.pagination.limit).toBe(20);
  });

  it('should return correct totalPages for multiple pages', async () => {
    mockDb
      .mockReturnValueOnce({
        where: jest.fn().mockReturnThis(),
        first: jest.fn().mockResolvedValue(mockWallet),
      })
      .mockReturnValueOnce({
        where: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        offset: jest.fn().mockResolvedValue(mockTransactions),
      })
      .mockReturnValueOnce({
        where: jest.fn().mockReturnThis(),
        count: jest.fn().mockReturnThis(),
        first: jest.fn().mockResolvedValue({ total: 45 }),
      });

    const result = await TransactionService.getTransactionsByWallet(
      walletId,
      userId,
      { page: 1, limit: 20 },
    );

    expect(result.pagination.total).toBe(45);
    expect(result.pagination.total_pages).toBe(3);
  });

  it('should return empty results when wallet has no transactions', async () => {
    mockDb
      .mockReturnValueOnce({
        where: jest.fn().mockReturnThis(),
        first: jest.fn().mockResolvedValue(mockWallet),
      })
      .mockReturnValueOnce({
        where: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        offset: jest.fn().mockResolvedValue([]),
      })
      .mockReturnValueOnce({
        where: jest.fn().mockReturnThis(),
        count: jest.fn().mockReturnThis(),
        first: jest.fn().mockResolvedValue({ total: 0 }),
      });

    const result = await TransactionService.getTransactionsByWallet(
      walletId,
      userId,
      pagination,
    );

    expect(result.results).toHaveLength(0);
    expect(result.pagination.total).toBe(0);
    expect(result.pagination.total_pages).toBe(0);
  });

  it('should throw 404 if wallet does not exist', async () => {
    mockDb.mockReturnValue({
      where: jest.fn().mockReturnThis(),
      first: jest.fn().mockResolvedValue(null),
    });

    await expect(
      TransactionService.getTransactionsByWallet(walletId, userId, pagination),
    ).rejects.toMatchObject({ status: 404, message: 'Wallet not found' });
  });

  it('should throw 403 if user does not own the wallet', async () => {
    mockDb.mockReturnValue({
      where: jest.fn().mockReturnThis(),
      first: jest
        .fn()
        .mockResolvedValue({
          ...mockWallet,
          user_id: uuidToBinary(differentUserId),
        }),
    });

    await expect(
      TransactionService.getTransactionsByWallet(walletId, userId, pagination),
    ).rejects.toMatchObject({
      status: 403,
      message: 'You do not have access to this wallet',
    });
  });
});
