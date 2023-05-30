"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const config_1 = require("../config");
const PasswordServices_1 = require("./PasswordServices");
class TokenService {
    generateTokens(payload) {
        const accessToken = jsonwebtoken_1.default.sign(payload, config_1.config.secret, { expiresIn: '24h' });
        const refreshToken = jsonwebtoken_1.default.sign(payload, config_1.config.refreshSecret, { expiresIn: '30d' });
        return {
            accessToken,
            refreshToken,
        };
    }
    generateCodeToken() {
        const code = (0, PasswordServices_1.generateRandomCode)();
        const token = jsonwebtoken_1.default.sign({ code }, config_1.config.codeSecret, { expiresIn: 5 * 60 * 1000 });
        return {
            token,
            code,
        };
    }
    getCode(token) {
        const res = jsonwebtoken_1.default.verify(token, config_1.config.codeSecret);
        return res.code;
    }
}
exports.default = new TokenService();
