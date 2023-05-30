"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const DialogController_1 = __importDefault(require("../controllers/DialogController"));
const AuthMiddleware_1 = require("../middleware/AuthMiddleware");
const ValdiationMiddlewares_1 = require("../middleware/ValdiationMiddlewares");
const router = (0, express_1.Router)();
router.get('/', AuthMiddleware_1.authMiddleware, DialogController_1.default.getDialogs);
router.get('/:dialogId', AuthMiddleware_1.authMiddleware, DialogController_1.default.getDialogInfo);
router.post('/create', AuthMiddleware_1.authMiddleware, [
    (0, ValdiationMiddlewares_1.required)('userId'),
    (0, ValdiationMiddlewares_1.required)('text'),
], DialogController_1.default.createDialogByRequest);
exports.default = router;
