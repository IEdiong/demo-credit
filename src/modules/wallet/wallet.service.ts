import db from '../../database/knex';
import {
  generateUUID,
  uuidToBinary,
  binaryToUUID,
  generateReference,
} from '../../utils/uuid';

interface FundPayload {
  wallet_id: string;
  userId: string;
  amount: number;
}

interface TransferPayload {
  wallet_id: string;
  userId: string;
  recipient_email: string;
  amount: number;
  description?: string;
}

interface WithdrawPayload {
  wallet_id: string;
  userId: string;
  amount: number;
}

const getWalletById = async (wallet_id: string) => {
  return db('wallets')
    .where({ id: uuidToBinary(wallet_id) })
    .first();
};

const verifyWalletOwnership = async (wallet_id: string, userId: string) => {
  const wallet = await getWalletById(wallet_id);

  if (!wallet) {
    throw { status: 404, message: 'Wallet not found' };
  }

  if (binaryToUUID(wallet.user_id) !== userId) {
    throw { status: 403, message: 'You do not have access to this wallet' };
  }

  return wallet;
};

export const getWallet = async (wallet_id: string, userId: string) => {
  const wallet = await verifyWalletOwnership(wallet_id, userId);

  return {
    id: binaryToUUID(wallet.id),
    balance: Number(wallet.balance),
    created_at: wallet.created_at,
  };
};

export const fundWallet = async (payload: FundPayload) => {
  const { wallet_id, userId, amount } = payload;

  const wallet = await verifyWalletOwnership(wallet_id, userId);
  const reference = generateReference();

  await db.transaction(async (trx) => {
    await trx('wallets')
      .where({ id: uuidToBinary(wallet_id) })
      .increment('balance', amount);

    await trx('transactions').insert({
      id: uuidToBinary(generateUUID()),
      wallet_id: uuidToBinary(wallet_id),
      type: 'credit',
      amount,
      reference,
      description: 'Wallet funded',
    });
  });

  const updatedWallet = await getWalletById(wallet_id);

  return {
    reference,
    balance: Number(updatedWallet.balance),
  };
};

export const transferFunds = async (payload: TransferPayload) => {
  const { wallet_id, userId, recipient_email, amount, description } = payload;

  const senderWallet = await verifyWalletOwnership(wallet_id, userId);

  if (Number(senderWallet.balance) < amount) {
    throw { status: 400, message: 'Insufficient balance' };
  }

  // Resolve recipient by email
  const recipientUser = await db('users')
    .where({ email: recipient_email })
    .first();
  if (!recipientUser) {
    throw { status: 404, message: 'Recipient not found' };
  }

  const recipientWallet = await db('wallets')
    .where({ user_id: recipientUser.id })
    .first();

  if (!recipientWallet) {
    throw { status: 404, message: 'Recipient wallet not found' };
  }

  // Prevent self-transfer
  if (binaryToUUID(recipientWallet.id) === wallet_id) {
    throw {
      status: 400,
      message: 'You cannot transfer funds to your own wallet',
    };
  }

  const reference = generateReference();
  const transferDescription = description || `Transfer to ${recipient_email}`;

  await db.transaction(async (trx) => {
    // Debit sender
    await trx('wallets')
      .where({ id: uuidToBinary(wallet_id) })
      .decrement('balance', amount);

    await trx('transactions').insert({
      id: uuidToBinary(generateUUID()),
      wallet_id: uuidToBinary(wallet_id),
      type: 'debit',
      amount,
      reference,
      description: transferDescription,
    });

    // Credit receiver
    await trx('wallets')
      .where({ id: recipientWallet.id })
      .increment('balance', amount);

    await trx('transactions').insert({
      id: uuidToBinary(generateUUID()),
      wallet_id: recipientWallet.id,
      type: 'credit',
      amount,
      reference,
      description: `Transfer from ${userId}`,
    });
  });

  const updatedWallet = await getWalletById(wallet_id);

  return {
    reference,
    balance: Number(updatedWallet.balance),
  };
};

export const withdrawFunds = async (payload: WithdrawPayload) => {
  const { wallet_id, userId, amount } = payload;

  const wallet = await verifyWalletOwnership(wallet_id, userId);

  if (Number(wallet.balance) < amount) {
    throw { status: 400, message: 'Insufficient balance' };
  }

  const reference = generateReference();

  await db.transaction(async (trx) => {
    await trx('wallets')
      .where({ id: uuidToBinary(wallet_id) })
      .decrement('balance', amount);

    await trx('transactions').insert({
      id: uuidToBinary(generateUUID()),
      wallet_id: uuidToBinary(wallet_id),
      type: 'debit',
      amount,
      reference,
      description: 'Wallet withdrawal',
    });
  });

  const updatedWallet = await getWalletById(wallet_id);

  return {
    reference,
    balance: Number(updatedWallet.balance),
  };
};
