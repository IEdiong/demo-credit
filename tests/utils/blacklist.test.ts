import { ofetch, FetchError } from 'ofetch';
import { isBlacklisted } from '../../src/utils/blacklist';

jest.mock('ofetch');
const mockFetch = ofetch as jest.MockedFunction<typeof ofetch>;
let consoleErrorSpy: jest.SpyInstance;

const blacklistedEmail = 'blacklisted@example.com';
const cleanEmail = 'clean@example.com';

const mockBlacklistResponse = {
  status: 'success',
  message: 'Successful',
  data: {
    karma_identity: blacklistedEmail,
    amount_in_contention: '0.00',
    reason: 'Some negative reason for blacklisting',
    default_date: '2020-05-18',
    karma_type: { karma: 'Others' },
    karma_identity_type: { identity_type: 'Email' },
    reporting_entity: { name: 'Blinkcash', email: 'support@blinkcash.ng' },
  },
  meta: { cost: 10, balance: 1600 },
};

describe('isBlacklisted', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    consoleErrorSpy = jest
      .spyOn(console, 'error')
      .mockImplementation(() => undefined);
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  it('should return true if email is on the blacklist', async () => {
    mockFetch.mockResolvedValue(mockBlacklistResponse);

    const result = await isBlacklisted(blacklistedEmail);

    expect(result).toBe(true);
    expect(mockFetch).toHaveBeenCalledTimes(1);
  });

  it('should return false if email is not on the blacklist (404)', async () => {
    const error = new FetchError('Not Found');
    Object.defineProperty(error, 'response', { value: { status: 404 } });
    mockFetch.mockRejectedValue(error);

    const result = await isBlacklisted(cleanEmail);

    expect(result).toBe(false);
  });

  it('should return false and log on unexpected API errors', async () => {
    mockFetch.mockRejectedValue(new Error('Network Error'));

    const result = await isBlacklisted(cleanEmail);

    expect(result).toBe(false);
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      '[Blacklist Check Error]',
      expect.any(Error),
    );
  });

  it('should return false if API response data is null', async () => {
    mockFetch.mockResolvedValue({
      status: 'success',
      message: 'Successful',
      data: null,
      meta: { cost: 10, balance: 1600 },
    });

    const result = await isBlacklisted(cleanEmail);

    expect(result).toBe(false);
  });

  it('should call the correct Adjutor API endpoint with the email', async () => {
    mockFetch.mockResolvedValue(mockBlacklistResponse);

    await isBlacklisted(blacklistedEmail);

    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining(blacklistedEmail),
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: expect.stringContaining('Bearer'),
        }),
      }),
    );
  });
});
