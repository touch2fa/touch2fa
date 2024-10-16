"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateTOTP = void 0;
const otplib_1 = require("otplib");
function generateTOTP(secret) {
    return otplib_1.authenticator.generate(secret);
}
exports.generateTOTP = generateTOTP;
