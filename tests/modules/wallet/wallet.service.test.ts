import * as WalletService from '../../../src/modules/wallet/wallet.service';
import { uuidv7 } from 'uuidv7';
import { uuidToBinary } from '../../../src/utils/uuid';

jest.mock('../../../src/database/knex', () => {
  const mockTrx: any = jest.fn();
  mockTrx.where = jest.fn().mockReturnThis();
  mockTrx.increment = jest.fn().mockResolvedValue(1);
  mockTrx.decrement = jest.fn().mockResolvedValue(1);
  mockTrx.insert = jest.fn().mockResolvedValue([1]);
  mockTrx.mockReturnValue(mockTrx); // trx('tableName') returns mockTrx for chaining

  const mockDb: any = jest.fn();
  mockDb.transaction = jest.fn(async (cb: any) => cb(mockTrx));
  return { __esModule: true, default: mockDb };
});

import db from '../../../src/database/knex';
const mockDb = db as jest.MockedFunction<any>;

const userId = uuidv7();
const walletId = uuidv7();
const recipientUserId = uuidv7();
const recipientWalletId = uuidv7();

const mockWallet = {
  id: uuidToBinary(walletId),
  user_id: uuidToBinary(userId),
  balance: '1000.00',
  created_at: new Date(),
};

const mockRecipientUser = {
  id: uuidToBinary(recipientUserId),
  email: 'recipient@example.com',
};

const mockRecipientWallet = {
  id: uuidToBinary(recipientWalletId),
  user_id: uuidToBinary(recipientUserId),
  balance: '500.00',
};

describe('WalletService - fundWallet', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockDb.mockReset(); // flush unconsumed mockReturnValueOnce values from prior tests
  });

  it('should fund wallet successfully', async () => {
    mockDb
      .mockReturnValueOnce({
        where: jest.fn().mockReturnThis(),
        first: jest.fn().mockResolvedValue(mockWallet),
      })
      .mockReturnValueOnce({
        where: jest.fn().mockReturnThis(),
        first: jest
          .fn()
          .mockResolvedValue({ ...mockWallet, balance: '1500.00' }),
      });

    const result = await WalletService.fundWallet({
      walletId,
      userId,
      amount: 500,
    });

    expect(result).toHaveProperty('reference');
    expect(result.balance).toBe(1500);
  });

  it('should throw 404 if wallet not found', async () => {
    mockDb.mockReturnValue({
      where: jest.fn().mockReturnThis(),
      first: jest.fn().mockResolvedValue(null),
    });

    await expect(
      WalletService.fundWallet({ walletId, userId, amount: 500 }),
    ).rejects.toMatchObject({ status: 404, message: 'Wallet not found' });
  });

  it('should throw 403 if user does not own wallet', async () => {
    const differentUserId = uuidv7();
    mockDb.mockReturnValue({
      where: jest.fn().mockReturnThis(),
      first: jest.fn().mockResolvedValue({
        ...mockWallet,
        user_id: uuidToBinary(differentUserId),
      }),
    });

    await expect(
      WalletService.fundWallet({ walletId, userId, amount: 500 }),
    ).rejects.toMatchObject({ status: 403 });
  });
});

describe('WalletService - withdrawFunds', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockDb.mockReset();
  });

  it('should withdraw successfully', async () => {
    mockDb
      .mockReturnValueOnce({
        where: jest.fn().mockReturnThis(),
        first: jest.fn().mockResolvedValue(mockWallet),
      })
      .mockReturnValueOnce({
        where: jest.fn().mockReturnThis(),
        first: jest
          .fn()
          .mockResolvedValue({ ...mockWallet, balance: '500.00' }),
      });

    const result = await WalletService.withdrawFunds({
      walletId,
      userId,
      amount: 500,
    });

    expect(result).toHaveProperty('reference');
    expect(result.balance).toBe(500);
  });

  it('should throw 400 for insufficient balance', async () => {
    mockDb.mockReturnValue({
      where: jest.fn().mockReturnThis(),
      first: jest.fn().mockResolvedValue({ ...mockWallet, balance: '100.00' }),
    });

    await expect(
      WalletService.withdrawFunds({ walletId, userId, amount: 500 }),
    ).rejects.toMatchObject({ status: 400, message: 'Insufficient balance' });
  });
});

describe('WalletService - transferFunds', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockDb.mockReset();
  });

  it('should throw 400 for insufficient balance', async () => {
    mockDb.mockReturnValue({
      where: jest.fn().mockReturnThis(),
      first: jest.fn().mockResolvedValue({ ...mockWallet, balance: '100.00' }),
    });

    await expect(
      WalletService.transferFunds({
        walletId,
        userId,
        recipientEmail: 'recipient@example.com',
        amount: 500,
      }),
    ).rejects.toMatchObject({ status: 400, message: 'Insufficient balance' });
  });

  it('should throw 404 if recipient not found', async () => {
    mockDb
      .mockReturnValueOnce({
        where: jest.fn().mockReturnThis(),
        first: jest.fn().mockResolvedValue(mockWallet),
      })
      .mockReturnValueOnce({
        where: jest.fn().mockReturnThis(),
        first: jest.fn().mockResolvedValue(null),
      });

    await expect(
      WalletService.transferFunds({
        walletId,
        userId,
        recipientEmail: 'nobody@example.com',
        amount: 100,
      }),
    ).rejects.toMatchObject({ status: 404, message: 'Recipient not found' });
  });

  it('should throw 400 on self-transfer', async () => {
    mockDb
      .mockReturnValueOnce({
        where: jest.fn().mockReturnThis(),
        first: jest.fn().mockResolvedValue(mockWallet),
      })
      .mockReturnValueOnce({
        where: jest.fn().mockReturnThis(),
        first: jest.fn().mockResolvedValue(mockRecipientUser),
      })
      .mockReturnValueOnce({
        where: jest.fn().mockReturnThis(),
        first: jest.fn().mockResolvedValue({
          ...mockRecipientWallet,
          id: uuidToBinary(walletId),
        }),
      });

    await expect(
      WalletService.transferFunds({
        walletId,
        userId,
        recipientEmail: 'recipient@example.com',
        amount: 100,
      }),
    ).rejects.toMatchObject({
      status: 400,
      message: 'You cannot transfer funds to your own wallet',
    });
  });

  it('should transfer funds successfully', async () => {
    mockDb
      .mockReturnValueOnce({
        where: jest.fn().mockReturnThis(),
        first: jest.fn().mockResolvedValue(mockWallet),
      })
      .mockReturnValueOnce({
        where: jest.fn().mockReturnThis(),
        first: jest.fn().mockResolvedValue(mockRecipientUser),
      })
      .mockReturnValueOnce({
        where: jest.fn().mockReturnThis(),
        first: jest.fn().mockResolvedValue(mockRecipientWallet),
      })
      .mockReturnValueOnce({
        where: jest.fn().mockReturnThis(),
        first: jest
          .fn()
          .mockResolvedValue({ ...mockWallet, balance: '900.00' }),
      });

    const result = await WalletService.transferFunds({
      walletId,
      userId,
      recipientEmail: 'recipient@example.com',
      amount: 100,
    });

    expect(result).toHaveProperty('reference');
    expect(result.balance).toBe(900);
  });
});
