import { uuidv7 } from 'uuidv7';

/**
 * Generates a new UUIDv7 string.
 * UUIDv7 is time-ordered, giving better DB index performance than UUIDv4
 * while still preventing sequential ID enumeration attacks.
 */
export const generateUUID = (): string => uuidv7();

/**
 * Converts a UUID string to a 16-byte Buffer for storage in binary(16) columns.
 * e.g. "01959b2a-3f4e-7c8d-b2e1-4f8a9c1d3e7f" → Buffer
 */
export const uuidToBinary = (uuid: string): Buffer => {
  return Buffer.from(uuid.replace(/-/g, ''), 'hex');
};

/**
 * Converts a binary(16) Buffer retrieved from MySQL back to a UUID string.
 * e.g. Buffer → "01959b2a-3f4e-7c8d-b2e1-4f8a9c1d3e7f"
 */
export const binaryToUUID = (binary: Buffer): string => {
  const hex = binary.toString('hex');
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
};

/**
 * Generates a unique transaction reference string.
 * Format: TXN-<nanoid-style suffix>
 */
export const generateReference = (): string => {
  const suffix = generateUUID().replace(/-/g, '').slice(0, 12).toUpperCase();
  return `TXN-${suffix}`;
};
