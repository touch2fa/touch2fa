// packages/core/tests/generateTOTP.test.ts
import { generateTOTP } from '../src/totp/generateTOTP';

test('generateTOTP returns a 6-digit code', () => {
  const secret = 'KVKFKRCPNZQUYMLXOVYDSQKJKZDTSRLD';
  const code = generateTOTP(secret);
  expect(code).toMatch(/^\d{6}$/);
});
