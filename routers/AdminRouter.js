"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const AdminController_1 = __importDefault(require("../controllers/AdminController"));
const AuthMiddleware_1 = require("../middleware/AuthMiddleware");
const RoleMiddleware_1 = require("../middleware/RoleMiddleware");
const ValdiationMiddlewares_1 = require("../middleware/ValdiationMiddlewares");
const router = (0, express_1.Router)();
router.post('/login', [
    (0, ValdiationMiddlewares_1.required)('email'),
    (0, ValdiationMiddlewares_1.required)('password'),
], AdminController_1.default.login);
router.get('/roles', AuthMiddleware_1.authMiddleware, (0, RoleMiddleware_1.roleMiddleware)(['ADMIN', 'MODERATOR']), AdminController_1.default.getRoles);
router.get('/posts/:id', AuthMiddleware_1.authMiddleware, (0, RoleMiddleware_1.roleMiddleware)(['ADMIN', 'MODERATOR']), AdminController_1.default.getPost);
router.get('/posts', AuthMiddleware_1.authMiddleware, (0, RoleMiddleware_1.roleMiddleware)(['ADMIN', 'MODERATOR']), AdminController_1.default.getPosts);
router.post('/users/create', AuthMiddleware_1.authMiddleware, (0, RoleMiddleware_1.roleMiddleware)(['ADMIN']), [
    (0, ValdiationMiddlewares_1.required)('email').isEmail(),
    (0, ValdiationMiddlewares_1.required)('password').isLength({ min: 4, max: 30 }),
    (0, ValdiationMiddlewares_1.required)('firstName'),
    (0, ValdiationMiddlewares_1.required)('lastName'),
], AdminController_1.default.createUser);
router.get('/users', AuthMiddleware_1.authMiddleware, (0, RoleMiddleware_1.roleMiddleware)(['ADMIN', 'MODERATOR']), AdminController_1.default.getUsers);
router.get('/users/:id', AuthMiddleware_1.authMiddleware, (0, RoleMiddleware_1.roleMiddleware)(['ADMIN', 'MODERATOR']), AdminController_1.default.getUser);
router.post('/tags/create', AuthMiddleware_1.authMiddleware, (0, RoleMiddleware_1.roleMiddleware)(['ADMIN', 'MODERATOR']), [
    (0, ValdiationMiddlewares_1.required)('value'),
], AdminController_1.default.createTag);
router.post('/roles/create', AuthMiddleware_1.authMiddleware, (0, RoleMiddleware_1.roleMiddleware)(['ADMIN']), [
    (0, ValdiationMiddlewares_1.required)('value'),
], AdminController_1.default.createRole);
router.delete('/tags/:id', AuthMiddleware_1.authMiddleware, (0, RoleMiddleware_1.roleMiddleware)(['ADMIN', 'MODERATOR']), AdminController_1.default.deleteTag);
router.put('/tags/:id', AuthMiddleware_1.authMiddleware, (0, RoleMiddleware_1.roleMiddleware)(['ADMIN', 'MODERATOR']), [
    (0, ValdiationMiddlewares_1.required)('value'),
], AdminController_1.default.updateTag);
router.delete('/roles/:id', AuthMiddleware_1.authMiddleware, (0, RoleMiddleware_1.roleMiddleware)(['ADMIN']), AdminController_1.default.deleteRole);
router.delete('/posts/:id', AuthMiddleware_1.authMiddleware, (0, RoleMiddleware_1.roleMiddleware)(['ADMIN']), AdminController_1.default.deletePost);
router.put('/roles/:id', AuthMiddleware_1.authMiddleware, (0, RoleMiddleware_1.roleMiddleware)(['ADMIN']), [
    (0, ValdiationMiddlewares_1.required)('value'),
], AdminController_1.default.updateRole);
router.post('/users/ban/:id', AuthMiddleware_1.authMiddleware, (0, RoleMiddleware_1.roleMiddleware)(['ADMIN', 'MODERATOR']), [
    (0, ValdiationMiddlewares_1.required)('text'),
], AdminController_1.default.banUser);
router.post('/users/unban/:id', AuthMiddleware_1.authMiddleware, (0, RoleMiddleware_1.roleMiddleware)(['ADMIN', 'MODERATOR']), AdminController_1.default.unbanUser);
router.post('/posts/ban/:id', AuthMiddleware_1.authMiddleware, (0, RoleMiddleware_1.roleMiddleware)(['ADMIN', 'MODERATOR']), [
    (0, ValdiationMiddlewares_1.required)('text'),
], AdminController_1.default.banPost);
router.post('/posts/unban/:id', AuthMiddleware_1.authMiddleware, (0, RoleMiddleware_1.roleMiddleware)(['ADMIN', 'MODERATOR']), AdminController_1.default.unbanPost);
router.post('/users/change/roles', AuthMiddleware_1.authMiddleware, (0, RoleMiddleware_1.roleMiddleware)(['ADMIN']), [
    (0, ValdiationMiddlewares_1.required)('userId'),
], AdminController_1.default.changeUserRoles);
exports.default = router;
