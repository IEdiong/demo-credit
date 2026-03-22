process.env.JWT_SECRET = 'test-secret';

import * as UserService from '../../../src/modules/user/user.service';
import * as blacklistUtil from '../../../src/utils/blacklist';
import db from '../../../src/database/knex';

jest.mock('../../../src/utils/blacklist');
jest.mock('../../../src/database/knex', () => {
  const mockTrx: any = jest.fn();
  mockTrx.insert = jest.fn().mockResolvedValue([1]);
  mockTrx.mockReturnValue(mockTrx); // trx('tableName') returns mockTrx for chaining
  const mockDb: any = jest.fn(() => ({
    where: jest.fn().mockReturnThis(),
    orWhere: jest.fn().mockReturnThis(),
    first: jest.fn().mockResolvedValue(null),
  }));
  mockDb.transaction = jest.fn(async (cb: any) => cb(mockTrx));
  return { __esModule: true, default: mockDb };
});

const mockIsBlacklisted = blacklistUtil.isBlacklisted as jest.Mock;
const mockDb = db as jest.MockedFunction<any>;

const registerPayload = {
  first_name: 'John',
  last_name: 'Doe',
  email: 'john@example.com',
  phone_number: '08012345678',
  password: 'password123',
};

describe('UserService - registerUser', () => {
  beforeEach(() => jest.clearAllMocks());

  it('should register a user successfully', async () => {
    mockIsBlacklisted.mockResolvedValue(false);
    mockDb.mockReturnValue({
      where: jest.fn().mockReturnThis(),
      orWhere: jest.fn().mockReturnThis(),
      first: jest.fn().mockResolvedValue(null),
    });

    const result = await UserService.registerUser(registerPayload);

    expect(result).toHaveProperty('token');
    expect(result.user.email).toBe(registerPayload.email);
    expect(result.user).not.toHaveProperty('password');
  });

  it('should throw 403 if user is blacklisted', async () => {
    mockIsBlacklisted.mockResolvedValue(true);

    await expect(
      UserService.registerUser(registerPayload),
    ).rejects.toMatchObject({
      status: 403,
      message: 'We are unable to create an account for you at this time.',
    });
  });

  it('should throw 409 if email already exists', async () => {
    mockIsBlacklisted.mockResolvedValue(false);
    mockDb.mockReturnValue({
      where: jest.fn().mockReturnThis(),
      orWhere: jest.fn().mockReturnThis(),
      first: jest.fn().mockResolvedValue({ id: 'existing-user' }),
    });

    await expect(
      UserService.registerUser(registerPayload),
    ).rejects.toMatchObject({ status: 409 });
  });
});

describe('UserService - loginUser', () => {
  beforeEach(() => jest.clearAllMocks());

  it('should throw 401 if user does not exist', async () => {
    mockDb.mockReturnValue({
      where: jest.fn().mockReturnThis(),
      first: jest.fn().mockResolvedValue(null),
    });

    await expect(
      UserService.loginUser({
        email: 'notfound@example.com',
        password: 'password123',
      }),
    ).rejects.toMatchObject({
      status: 401,
      message: 'Invalid email or password',
    });
  });

  it('should throw 401 if password is incorrect', async () => {
    mockDb.mockReturnValue({
      where: jest.fn().mockReturnThis(),
      first: jest.fn().mockResolvedValue({
        id: Buffer.from('abc123'),
        email: 'john@example.com',
        password: 'wronghash',
      }),
    });

    await expect(
      UserService.loginUser({
        email: 'john@example.com',
        password: 'wrongpassword',
      }),
    ).rejects.toMatchObject({ status: 401 });
  });
});
