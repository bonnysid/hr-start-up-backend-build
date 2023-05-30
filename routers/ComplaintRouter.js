"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const ComplaintController_1 = __importDefault(require("../controllers/ComplaintController"));
const AuthMiddleware_1 = require("../middleware/AuthMiddleware");
const RoleMiddleware_1 = require("../middleware/RoleMiddleware");
const ValdiationMiddlewares_1 = require("../middleware/ValdiationMiddlewares");
const router = (0, express_1.Router)();
router.get('/', AuthMiddleware_1.authMiddleware, (0, RoleMiddleware_1.roleMiddleware)(['ADMIN', 'MODERATOR']), ComplaintController_1.default.getComplaints);
router.get('/my', AuthMiddleware_1.authMiddleware, ComplaintController_1.default.getMyComplaints);
router.get('/:id', AuthMiddleware_1.authMiddleware, ComplaintController_1.default.getComplaint);
router.post('/post', AuthMiddleware_1.authMiddleware, [
    (0, ValdiationMiddlewares_1.required)('text'),
    (0, ValdiationMiddlewares_1.required)('postId'),
], ComplaintController_1.default.createPostComplaint);
router.post('/user', AuthMiddleware_1.authMiddleware, [
    (0, ValdiationMiddlewares_1.required)('text'),
    (0, ValdiationMiddlewares_1.required)('userId'),
], ComplaintController_1.default.createUserComplaint);
router.post('/resolve/:id', AuthMiddleware_1.authMiddleware, (0, RoleMiddleware_1.roleMiddleware)(['ADMIN', 'MODERATOR']), ComplaintController_1.default.resolveComplaint);
router.post('/close/:id', AuthMiddleware_1.authMiddleware, (0, RoleMiddleware_1.roleMiddleware)(['ADMIN', 'MODERATOR']), ComplaintController_1.default.closeComplaint);
router.post('/unresolve/:id', AuthMiddleware_1.authMiddleware, (0, RoleMiddleware_1.roleMiddleware)(['ADMIN', 'MODERATOR']), ComplaintController_1.default.unresolveComplaint);
exports.default = router;
