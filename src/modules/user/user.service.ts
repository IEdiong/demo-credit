import bcrypt from 'bcryptjs';
import { sign, type Secret } from 'jsonwebtoken';
import db from '../../database/knex';
import { isBlacklisted } from '../../utils/blacklist';
import { generateUUID, uuidToBinary, binaryToUUID } from '../../utils/uuid';

interface RegisterPayload {
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
  password: string;
}

interface LoginPayload {
  email: string;
  password: string;
}

interface UserResponse {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
  wallet_id: string;
  created_at: Date;
}

const SALT_ROUNDS = 10;

const formatUser = (user: any, walletId: string): UserResponse => ({
  id: binaryToUUID(user.id),
  first_name: user.first_name,
  last_name: user.last_name,
  email: user.email,
  phone_number: user.phone_number,
  wallet_id: walletId,
  created_at: user.created_at,
});

const generateToken = (userId: string): string => {
  return sign({ id: userId }, process.env.JWT_SECRET as Secret, {
    expiresIn: Number(process.env.JWT_EXPIRES_IN) || 60 * 60 * 24, // Default to 24 hours
  });
};

export const registerUser = async (payload: RegisterPayload) => {
  const { first_name, last_name, email, phone_number, password } = payload;

  // Check Karma blacklist before any DB operations
  const blacklisted = await isBlacklisted(email);
  if (blacklisted) {
    throw {
      status: 403,
      message: 'We are unable to create an account for you at this time.',
    };
  }

  // Check for existing email or phone
  const existingUser = await db('users')
    .where({ email })
    .orWhere({ phone_number })
    .first();

  if (existingUser) {
    throw {
      status: 409,
      message: 'A user with this email or phone number already exists',
    };
  }

  const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
  const userId = generateUUID();
  const walletId = generateUUID();

  // User creation and wallet creation must succeed together or not at all
  await db.transaction(async (trx) => {
    await trx('users').insert({
      id: uuidToBinary(userId),
      first_name,
      last_name,
      email,
      phone_number,
      password: hashedPassword,
    });

    await trx('wallets').insert({
      id: uuidToBinary(walletId),
      user_id: uuidToBinary(userId),
      balance: 0.0,
    });
  });

  const token = generateToken(userId);

  return {
    user: {
      id: userId,
      first_name,
      last_name,
      email,
      phone_number,
      wallet_id: walletId,
    },
    token,
  };
};

export const loginUser = async (payload: LoginPayload) => {
  const { email, password } = payload;

  const user = await db('users').where({ email }).first();

  if (!user) {
    throw { status: 401, message: 'Invalid email or password' };
  }

  const passwordMatch = await bcrypt.compare(password, user.password);
  if (!passwordMatch) {
    throw { status: 401, message: 'Invalid email or password' };
  }

  const wallet = await db('wallets').where({ user_id: user.id }).first();

  const userId = binaryToUUID(user.id);
  const token = generateToken(userId);

  return {
    user: formatUser(user, binaryToUUID(wallet.id)),
    token,
  };
};
