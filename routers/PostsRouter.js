"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const PostsController_1 = __importDefault(require("../controllers/PostsController"));
const AuthMiddleware_1 = require("../middleware/AuthMiddleware");
const body_parser_1 = __importDefault(require("body-parser"));
const multer_1 = __importDefault(require("multer"));
const ValdiationMiddlewares_1 = require("../middleware/ValdiationMiddlewares");
const router = (0, express_1.Router)();
const upload = (0, multer_1.default)({ dest: 'videos/' });
router.post('/create', upload.single('video'), body_parser_1.default.urlencoded({ extended: true }), AuthMiddleware_1.authMiddleware, [
    (0, ValdiationMiddlewares_1.required)('title'),
    (0, ValdiationMiddlewares_1.required)('description'),
    (0, ValdiationMiddlewares_1.required)('shortDescription'),
], PostsController_1.default.createPost);
router.get('/', AuthMiddleware_1.authMiddleware, PostsController_1.default.getPosts);
router.get('/me', AuthMiddleware_1.authMiddleware, PostsController_1.default.getMyPosts);
router.get('/favorites', AuthMiddleware_1.authMiddleware, PostsController_1.default.getFavoritePosts);
router.get('/user/:userId', AuthMiddleware_1.authMiddleware, PostsController_1.default.getUserPosts);
router.get('/:id', AuthMiddleware_1.authMiddleware, PostsController_1.default.getPost);
router.delete('/:id', AuthMiddleware_1.authMiddleware, PostsController_1.default.deletePost);
router.put('/:id', AuthMiddleware_1.authMiddleware, PostsController_1.default.editPost);
router.post('/favorite/:id', AuthMiddleware_1.authMiddleware, PostsController_1.default.favoritePost);
router.post('/unfavorite/:id', AuthMiddleware_1.authMiddleware, PostsController_1.default.unFavoritePost);
router.post('/comment', AuthMiddleware_1.authMiddleware, [
    (0, ValdiationMiddlewares_1.required)('text'),
], PostsController_1.default.addCommentToPost);
router.put('/comment/:id', AuthMiddleware_1.authMiddleware, [
    (0, ValdiationMiddlewares_1.required)('text'),
], PostsController_1.default.editComment);
router.delete('/comment/:id', AuthMiddleware_1.authMiddleware, PostsController_1.default.removeComment);
exports.default = router;
