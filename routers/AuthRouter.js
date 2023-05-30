"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const AuthController_1 = __importDefault(require("../controllers/AuthController"));
const ValdiationMiddlewares_1 = require("../middleware/ValdiationMiddlewares");
const AuthMiddleware_1 = require("../middleware/AuthMiddleware");
const router = (0, express_1.Router)();
router.post('/registration', [
    (0, ValdiationMiddlewares_1.required)('email').isEmail(),
    (0, ValdiationMiddlewares_1.required)('firstName'),
    (0, ValdiationMiddlewares_1.required)('lastName'),
    (0, ValdiationMiddlewares_1.required)('password').isLength({ min: 4, max: 30 }),
], AuthController_1.default.registration);
router.post('/login', [
    (0, ValdiationMiddlewares_1.required)('email'),
    (0, ValdiationMiddlewares_1.required)('password'),
], AuthController_1.default.login);
router.post('/refresh', AuthController_1.default.refreshToken);
router.post('/logout', AuthMiddleware_1.authMiddleware, AuthController_1.default.logout);
router.post('/logout/session', AuthMiddleware_1.authMiddleware, AuthController_1.default.logoutSession);
exports.default = router;
