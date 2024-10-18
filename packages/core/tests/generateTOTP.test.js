"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// packages/core/tests/generateTOTP.test.ts
const generateTOTP_1 = require("../src/totp/generateTOTP");
test("generateTOTP returns a 6-digit code", () => {
  const secret = "KVKFKRCPNZQUYMLXOVYDSQKJKZDTSRLD";
  const code = (0, generateTOTP_1.generateTOTP)(secret);
  expect(code).toMatch(/^\d{6}$/);
});
