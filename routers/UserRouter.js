"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const UsersController_1 = __importDefault(require("../controllers/UsersController"));
const AuthMiddleware_1 = require("../middleware/AuthMiddleware");
const multer_1 = __importDefault(require("multer"));
const ValdiationMiddlewares_1 = require("../middleware/ValdiationMiddlewares");
const upload = (0, multer_1.default)({ dest: 'avatars/' });
const router = (0, express_1.Router)();
router.get('/', AuthMiddleware_1.authMiddleware, UsersController_1.default.getUsers);
router.get('/me', AuthMiddleware_1.authMiddleware, UsersController_1.default.getMe);
router.get('/sessions', AuthMiddleware_1.authMiddleware, UsersController_1.default.getSessions);
router.get('/:id', AuthMiddleware_1.authMiddleware, UsersController_1.default.getUser);
router.post('/change/password', AuthMiddleware_1.authMiddleware, [
    (0, ValdiationMiddlewares_1.required)('password'),
    (0, ValdiationMiddlewares_1.required)('newPassword').isLength({ min: 4, max: 30 }),
], UsersController_1.default.changePassword);
router.post('/change/email', AuthMiddleware_1.authMiddleware, [
    (0, ValdiationMiddlewares_1.required)('email').isEmail(),
], UsersController_1.default.changeEmail);
router.post('/change/email/confirm', AuthMiddleware_1.authMiddleware, [
    (0, ValdiationMiddlewares_1.required)('code'),
], UsersController_1.default.changeEmailConfirm);
router.post('/email/confirm', AuthMiddleware_1.authMiddleware, [
    (0, ValdiationMiddlewares_1.required)('code'),
], UsersController_1.default.confirmEmail);
router.post('/email/send/code', AuthMiddleware_1.authMiddleware, UsersController_1.default.sendVerificationEmailCode);
router.post('/change/info', AuthMiddleware_1.authMiddleware, [
    (0, ValdiationMiddlewares_1.required)('firstName'),
    (0, ValdiationMiddlewares_1.required)('lastName'),
], UsersController_1.default.changeInfo);
router.post('/avatar', upload.single('photo'), AuthMiddleware_1.authMiddleware, UsersController_1.default.uploadAvatar);
exports.default = router;
