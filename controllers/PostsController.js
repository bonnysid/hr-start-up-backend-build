"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Post_1 = __importStar(require("../models/Post"));
const Comment_1 = __importStar(require("../models/Comment"));
const PostDTO_1 = __importStar(require("../dtos/PostDTO"));
const fs_1 = __importDefault(require("fs"));
const uuid_1 = require("uuid");
const get_video_duration_1 = require("get-video-duration");
const express_validator_1 = require("express-validator");
const CommentDTO_1 = __importDefault(require("../dtos/CommentDTO"));
class PostsController {
    getPosts(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { search = '', tags, sort = 'createdAt', sortValue = 'desc', } = req.query;
                const sortValueParsed = sortValue === 'desc' ? 'desc' : 'asc';
                const user = req.user;
                const posts = yield Post_1.default.find(Object.assign({ status: Post_1.PostStatus.ACTIVE, user: { $ne: user.id }, title: new RegExp(String(search), 'i'), favoriteUsers: { $ne: user.id } }, (tags ? { tags: { $in: tags } } : {}))).sort({ [String(sort)]: sortValueParsed }).populate([{
                        path: 'user',
                        populate: {
                            path: 'roles',
                        },
                    }, { path: 'tags' }, { path: 'comments' }]).exec();
                const postsDTOS = posts.map(it => new PostDTO_1.PostListItemDTO(it, req.user));
                return res.json(postsDTOS);
            }
            catch (e) {
                console.log(e);
                return res.status(500).json({ message: 'Server error' });
            }
        });
    }
    getFavoritePosts(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { user } = req;
                const { search = '', tags, sort = 'createdAt', sortValue = 'desc', } = req.query;
                const sortValueParsed = sortValue === 'desc' ? 'desc' : 'asc';
                const posts = yield Post_1.default.find(Object.assign({ status: Post_1.PostStatus.ACTIVE, title: new RegExp(String(search), 'i'), user: { $ne: user.id }, favoriteUsers: user.id }, (tags ? { tags: { $in: tags } } : {}))).sort({ [String(sort)]: sortValueParsed }).populate([{
                        path: 'user',
                        populate: {
                            path: 'roles',
                        },
                    }, { path: 'tags' }, { path: 'comments' }]).exec();
                return res.json(posts.map(it => new PostDTO_1.PostListItemDTO(it, req.user)));
            }
            catch (e) {
                console.log(e);
                return res.status(500).json({ message: 'Server error' });
            }
        });
    }
    favoritePost(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id } = req.params;
                const { user } = req;
                const post = yield Post_1.default.findOne({
                    status: Post_1.PostStatus.ACTIVE,
                    _id: id,
                    user: { $ne: user.id },
                });
                if (!post) {
                    return res.status(404).json({ message: 'Пост не найден' });
                }
                if (!post.favoriteUsers.map(it => it.toString()).includes(user.id)) {
                    post.favoriteUsers = [...post.favoriteUsers, user.id];
                    yield post.save();
                }
                else {
                    return res.status(400).json({ message: 'Пост уже в избранном' });
                }
                return res.json({ message: 'Пост успешно добавлен в избранное' });
            }
            catch (e) {
                console.log(e);
                return res.status(500).json({ message: 'Server error' });
            }
        });
    }
    unFavoritePost(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id } = req.params;
                const { user } = req;
                const post = yield Post_1.default.findOne({
                    status: Post_1.PostStatus.ACTIVE,
                    _id: id,
                });
                if (!post) {
                    return res.status(404).json({ message: 'Пост не найден' });
                }
                post.favoriteUsers = post.favoriteUsers.filter(it => it.toString() !== user.id);
                yield post.save();
                return res.json({ message: 'Пост успешно убран из избранного' });
            }
            catch (e) {
                console.log(e);
                return res.status(500).json({ message: 'Server error' });
            }
        });
    }
    getPost(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id } = req.params;
                const post = yield Post_1.default.findOne({ status: Post_1.PostStatus.ACTIVE, _id: id }).populate([
                    {
                        path: 'user',
                        populate: {
                            path: 'roles',
                        },
                    },
                    { path: 'tags' },
                    {
                        path: 'comments',
                        populate: {
                            path: 'user',
                        },
                    }
                ]).exec();
                if (!post) {
                    return res.status(404).json({ message: 'Пост не найден' });
                }
                post.views += 1;
                yield post.save();
                return res.json(new PostDTO_1.PostDetailDTO(post, req.user));
            }
            catch (e) {
                console.log(e);
                return res.status(500).json({ message: 'Server error' });
            }
        });
    }
    deletePost(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const user = req.user;
                const { id } = req.params;
                const post = yield Post_1.default.findOne({ _id: id, user: user.id });
                if (!post) {
                    return res.status(400).json({ message: 'Пост не найден' });
                }
                post.status = Post_1.PostStatus.DELETED;
                yield post.save();
                return res.json({ message: 'Пост успешно удален' });
            }
            catch (e) {
                console.log(e);
                return res.status(500).json({ message: 'Server error' });
            }
        });
    }
    addCommentToPost(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const errors = (0, express_validator_1.validationResult)(req);
                if (!errors.isEmpty()) {
                    return res.status(400).json({ message: 'Ошибка при создании', errors });
                }
                const { postId, text } = req.body;
                const { user } = req;
                const post = yield Post_1.default.findOne({ _id: postId });
                if (!post) {
                    return res.status(400).json({ message: 'Пост не найден' });
                }
                const comment = new Comment_1.default({ text, user: user.id });
                yield comment.save();
                post.comments = [...(post.comments || []), comment._id];
                yield post.save();
                return res.json(new CommentDTO_1.default(Object.assign(Object.assign({}, comment.toObject()), { user })));
            }
            catch (e) {
                console.log(e);
                return res.status(500).json({ message: 'Server error' });
            }
        });
    }
    removeComment(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id } = req.params;
                const { user } = req;
                const post = yield Post_1.default.findOne({ comments: id });
                if (!post) {
                    return res.status(400).json({ message: 'Пост не найден' });
                }
                const comment = yield Comment_1.default.findOne({ _id: id });
                if (!comment) {
                    return res.status(400).json({ message: 'Комментарий не найден' });
                }
                if (comment.user.toString() !== user.id) {
                    return res.status(403).json({ message: 'У вас не прав удалить этот комментарий' });
                }
                comment.status = Comment_1.CommentStatus.DELETED;
                yield comment.save();
                return res.json({ message: 'Комментарий успешно удален' });
            }
            catch (e) {
                console.log(e);
                return res.status(500).json({ message: 'Server error' });
            }
        });
    }
    editComment(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { user } = req;
                const { text } = req.body;
                const { id } = req.params;
                const comment = yield Comment_1.default.findOne({ _id: id, user: user.id });
                if (!comment) {
                    return res.status(400).json({ message: 'Комментарий не найден' });
                }
                comment.text = text;
                yield comment.save();
                return res.json(new CommentDTO_1.default(Object.assign(Object.assign({}, comment), { user })));
            }
            catch (e) {
                console.log(e);
                return res.status(500).json({ message: 'Server error' });
            }
        });
    }
    getUserPosts(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { userId } = req.params;
                const { search = '', tags, sort = 'createdAt', sortValue = 'desc', } = req.query;
                const sortValueParsed = sortValue === 'desc' ? 'desc' : 'asc';
                const posts = yield Post_1.default.find(Object.assign({ user: userId, status: Post_1.PostStatus.ACTIVE, title: new RegExp(String(search), 'i') }, (tags ? { tags: { $in: tags } } : {}))).sort({ [String(sort)]: sortValueParsed }).populate([{
                        path: 'user',
                        populate: {
                            path: 'roles',
                        },
                    }, { path: 'tags' }]).exec();
                const postsDTOS = posts.map(it => new PostDTO_1.PostListItemDTO(it, req.user));
                return res.json(postsDTOS);
            }
            catch (e) {
                console.log(e);
                return res.status(500).json({ message: 'Server error' });
            }
        });
    }
    getMyPosts(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const user = req.user;
                const { search = '', tags, sort = 'createdAt', sortValue = 'desc', } = req.query;
                const sortValueParsed = sortValue === 'desc' ? 'desc' : 'asc';
                const posts = yield Post_1.default.find(Object.assign({ user: user.id, title: new RegExp(String(search), 'i'), status: { $in: [Post_1.PostStatus.ACTIVE, Post_1.PostStatus.BANNED] } }, (tags ? { tags: { $in: tags } } : {}))).sort({ [String(sort)]: sortValueParsed }).populate([{
                        path: 'user',
                        populate: {
                            path: 'roles',
                        },
                    }, { path: 'tags' }, { path: 'banReason' }]).exec();
                const postsDTOS = posts.map(it => new PostDTO_1.PostListItemDTO(it, req.user));
                return res.json(postsDTOS);
            }
            catch (e) {
                console.log(e);
                return res.status(500).json({ message: 'Server error' });
            }
        });
    }
    createPost(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const errors = (0, express_validator_1.validationResult)(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ message: 'Ошибка при создании', errors });
            }
            const file = req.file;
            try {
                const { title, description, shortDescription, tags, } = req.body;
                const parsedTags = JSON.parse(tags);
                if (parsedTags.length > 3) {
                    return res.status(400).json({ message: 'Нельзя иметь больше 3 тегов' });
                }
                const user = req.user;
                const videoDuration = yield (0, get_video_duration_1.getVideoDurationInSeconds)(file.path);
                const fileName = user.id;
                const fileExtension = file.originalname.split('.').pop();
                const newFileName = `${(0, uuid_1.v4)()}.${fileName}.${fileExtension}`;
                const newFilePath = `videos/${newFileName}`;
                const videoUrl = `http://${req.headers.host}/videos/${newFileName}`;
                if (videoDuration > 30) {
                    fs_1.default.unlinkSync(file.path);
                    return res.status(400).json({ error: 'Длительность видео не должна привышать 30 секунд' });
                }
                fs_1.default.renameSync(file.path, newFilePath);
                const post = new Post_1.default({ title, description, shortDescription, tags: parsedTags, videoUrl, user: user.id });
                yield post.save();
                return res.json({ success: true, videoUrl, id: post._id });
            }
            catch (err) {
                console.error(err);
                fs_1.default.unlinkSync(file.path);
                res.status(500).json({ message: 'Server error' });
            }
        });
    }
    editPost(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const errors = (0, express_validator_1.validationResult)(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ message: 'Ошибка при создании', errors });
            }
            try {
                const { title, description, shortDescription, tags, } = req.body;
                const { id } = req.params;
                if (tags.length > 3) {
                    return res.status(400).json({ message: 'Нельзя иметь больше 3 тегов' });
                }
                const user = req.user;
                const post = yield Post_1.default.findOne({ _id: id, user: user.id, status: Post_1.PostStatus.ACTIVE }).populate([
                    {
                        path: 'user',
                        populate: {
                            path: 'roles',
                        },
                    },
                    { path: 'tags' }
                ]).exec();
                if (!post) {
                    return res.status(400).json({ message: 'Пост не найден' });
                }
                post.title = title || post.title;
                post.description = description || post.description;
                post.shortDescription = shortDescription || post.shortDescription;
                post.tags = tags || post.tags;
                yield post.save();
                return res.json(new PostDTO_1.default(post));
            }
            catch (err) {
                console.error(err);
                res.status(500).json({ message: 'Server error' });
            }
        });
    }
}
exports.default = new PostsController();
