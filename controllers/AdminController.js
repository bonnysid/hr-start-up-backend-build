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
const Role_1 = __importDefault(require("../models/Role"));
const Session_1 = __importDefault(require("../models/Session"));
const RoleDTO_1 = __importDefault(require("../dtos/RoleDTO"));
const express_validator_1 = require("express-validator");
const User_1 = __importStar(require("../models/User"));
const Tag_1 = __importDefault(require("../models/Tag"));
const Post_1 = __importStar(require("../models/Post"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const UserDTO_1 = __importDefault(require("../dtos/UserDTO"));
const TokenService_1 = __importDefault(require("../services/TokenService"));
const TagDTO_1 = __importDefault(require("../dtos/TagDTO"));
const PostDTO_1 = require("../dtos/PostDTO");
const IPService_1 = require("../services/IPService");
const fs_1 = __importDefault(require("fs"));
const Comment_1 = __importDefault(require("../models/Comment"));
const BanReason_1 = __importDefault(require("../models/BanReason"));
const PasswordServices_1 = require("../services/PasswordServices");
const USER_BAN_POST = 'Автор поста заблокирован';
class AdminController {
    getRoles(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const roles = yield Role_1.default.find();
                const canDeleteEdits = [];
                for (let i = 0; i < roles.length; i++) {
                    const user = yield User_1.default.findOne({ roles: { $in: roles[i].id } });
                    canDeleteEdits.push(!user);
                }
                const roleDTOS = roles.map((it, i) => {
                    return new RoleDTO_1.default(Object.assign(Object.assign({}, it.toObject()), { canDeleteEdit: canDeleteEdits[i] }));
                });
                return res.json(roleDTOS);
            }
            catch (e) {
                console.log(e);
                return res.status(403).json({ message: 'Нету доступа' });
            }
        });
    }
    createTag(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const errors = (0, express_validator_1.validationResult)(req);
                if (!errors.isEmpty()) {
                    return res.status(400).json({ message: 'Ошибка при создании', errors });
                }
                const { value } = req.body;
                const candidate = yield Tag_1.default.findOne({ value });
                if (candidate) {
                    return res.status(400).json({ message: 'Тег с таким именем уже существует' });
                }
                const tag = new Tag_1.default({ value });
                yield tag.save();
                return res.status(200).json(new TagDTO_1.default(tag));
            }
            catch (e) {
                console.log(e);
                res.status(400).json({ message: 'Create error' });
            }
        });
    }
    createRole(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const errors = (0, express_validator_1.validationResult)(req);
                if (!errors.isEmpty()) {
                    return res.status(400).json({ message: 'Ошибка при создании', errors });
                }
                const { value } = req.body;
                const candidate = yield Role_1.default.findOne({ value });
                if (candidate) {
                    return res.status(400).json({ message: 'Роль с таким именем уже существует' });
                }
                const role = new Role_1.default({ value });
                yield role.save();
                return res.status(200).json(new RoleDTO_1.default(role));
            }
            catch (e) {
                console.log(e);
                res.status(400).json({ message: 'Create error' });
            }
        });
    }
    changeUserRoles(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { roles, userId } = req.body;
                const user = yield User_1.default.findOne({ _id: userId });
                if (!user) {
                    return res.status(404).json({ message: 'Пользователь не найден' });
                }
                user.roles = roles;
                yield user.save();
                return res.status(200).json({ message: 'Роли пользователя успешно обновлены' });
            }
            catch (e) {
                console.log(e);
                res.status(500).json({ message: 'Server error' });
            }
        });
    }
    login(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const errors = (0, express_validator_1.validationResult)(req);
                if (!errors.isEmpty()) {
                    return res.status(400).json({ message: 'Ошибка при авторизации', errors });
                }
                const { email, password } = req.body;
                const candidate = yield User_1.default.findOne({ email: email.toLowerCase() }).populate('roles').exec();
                if (!candidate) {
                    return res.status(400).json({ message: 'Введенны неверные параметры' });
                }
                if (candidate.status === User_1.UserStatus.BANNED) {
                    return res.status(401).json({ message: 'Пользователь заблокирован' });
                }
                const validPassword = bcryptjs_1.default.compareSync(password, candidate.password);
                if (!validPassword) {
                    return res.status(400).json({ message: 'Введенны неверные параметры' });
                }
                const roles = candidate.roles.map(it => it.value);
                if (!roles.includes('ADMIN') && !roles.includes('MODERATOR') && !roles.includes('OPERATOR')) {
                    return res.status(400).json({ message: 'Введенны неверные параметры' });
                }
                const ipRes = IPService_1.IPService.getIp(req);
                if (ipRes.error) {
                    return res.status(400).json({ message: 'Введенны неверные параметры' });
                }
                const { ip, geo } = IPService_1.IPService.getIpInfo(ipRes.ip);
                const session = new Session_1.default({ ip, city: geo === null || geo === void 0 ? void 0 : geo.city, country: geo === null || geo === void 0 ? void 0 : geo.country });
                yield session.save();
                candidate.sessions = [...candidate.sessions, session._id];
                yield candidate.save();
                const userDTO = new UserDTO_1.default(candidate);
                const tokens = TokenService_1.default.generateTokens(Object.assign({}, userDTO));
                res.json({ accessToken: tokens.accessToken, refreshToken: tokens.refreshToken });
            }
            catch (e) {
                console.log(e);
                res.status(400).json({ message: 'Login error' });
            }
        });
    }
    createUser(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const errors = (0, express_validator_1.validationResult)(req);
                if (!errors.isEmpty()) {
                    return res.status(400).json({ message: 'Ошибка при создании', errors });
                }
                const { email, password, firstName, lastName, phone, roles, } = req.body;
                const candidate = yield User_1.default.findOne({ email: email.toLowerCase(), });
                const userRole = yield Role_1.default.findOne({ value: 'USER' });
                if (candidate) {
                    return res.status(400).json({ message: 'Пользователь с таким именем уже существует' });
                }
                const hashPassword = bcryptjs_1.default.hashSync(password, 7);
                const user = new User_1.default({
                    email: email.toLowerCase(),
                    password: hashPassword,
                    firstName,
                    lastName,
                    phone,
                    roles: roles.length ? roles : [userRole === null || userRole === void 0 ? void 0 : userRole._id],
                });
                yield user.save();
                return res.json(new UserDTO_1.default(user));
            }
            catch (e) {
                console.log(e);
                res.status(400).json({ message: 'Create error' });
            }
        });
    }
    updateTag(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const errors = (0, express_validator_1.validationResult)(req);
                if (!errors.isEmpty()) {
                    return res.status(400).json({ message: 'Ошибка при обновлении', errors });
                }
                const { value } = req.body;
                const { id } = req.params;
                const candidate = yield Tag_1.default.findOne({ _id: id });
                if (!candidate) {
                    return res.status(400).json({ message: 'Тег с таким id не найден' });
                }
                const post = yield Post_1.default.findOne({ tags: { $in: id } });
                if (!post) {
                    candidate.value = value;
                    yield candidate.save();
                    return res.status(200).json(candidate);
                }
                else {
                    res.status(400).json({ message: 'Тег используется в постах' });
                }
            }
            catch (e) {
                console.log(e);
                res.status(400).json({ message: 'Create error' });
            }
        });
    }
    deleteTag(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id } = req.params;
                const post = yield Post_1.default.findOne({ tags: { $in: id } });
                if (!post) {
                    yield Tag_1.default.findOneAndDelete({ _id: id });
                    return res.status(200).json({ success: true });
                }
                else {
                    res.status(400).json({ message: 'Тег используется в постах' });
                }
            }
            catch (e) {
                console.log(e);
                res.status(400).json({ message: 'Delete error' });
            }
        });
    }
    updateRole(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const errors = (0, express_validator_1.validationResult)(req);
                if (!errors.isEmpty()) {
                    return res.status(400).json({ message: 'Ошибка при обновлении', errors });
                }
                const { value } = req.body;
                const { id } = req.params;
                const candidate = yield Role_1.default.findOne({ _id: id });
                if (!candidate) {
                    return res.status(400).json({ message: 'Роль с таким id не найден' });
                }
                const user = yield User_1.default.findOne({ roles: { $in: id } });
                if (!user) {
                    candidate.value = value;
                    yield candidate.save();
                    return res.status(200).json(candidate);
                }
                else {
                    res.status(400).json({ message: 'Роль используется у пользователей' });
                }
            }
            catch (e) {
                console.log(e);
                res.status(400).json({ message: 'Update error' });
            }
        });
    }
    deleteRole(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id } = req.params;
                const user = yield User_1.default.findOne({ roles: { $in: id } });
                if (!user) {
                    yield Role_1.default.findOneAndDelete({ _id: id });
                    return res.status(200).json({ success: true });
                }
                else {
                    res.status(400).json({ message: 'Роль используется у пользователей' });
                }
            }
            catch (e) {
                console.log(e);
                res.status(400).json({ message: 'Delete error' });
            }
        });
    }
    getUsers(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { search = '', roles, status, } = req.query;
                const user = req.user;
                const users = yield User_1.default.find(Object.assign(Object.assign({ _id: { $ne: user.id }, $and: [
                        { email: new RegExp(String(search), 'i') },
                    ] }, (roles ? { roles: { $in: roles } } : {})), (status ? { status } : {}))).populate([
                    { path: 'roles' },
                    {
                        path: 'banReason',
                        populate: {
                            path: 'user',
                            populate: {
                                path: 'roles',
                            },
                        },
                    }
                ]).exec();
                const userDTOS = users.map(it => new UserDTO_1.default(it, true));
                return res.json(userDTOS);
            }
            catch (e) {
                console.log(e);
                res.status(500).json({ message: 'Server error' });
            }
        });
    }
    getPost(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id } = req.params;
                const post = yield Post_1.default.findOne({ _id: id }).populate([
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
                    },
                    {
                        path: 'banReason',
                        populate: {
                            path: 'user',
                            populate: {
                                path: 'roles',
                            },
                        },
                    }
                ]).exec();
                if (!post) {
                    return res.status(404).json({ message: 'Пост не найден' });
                }
                post.views += 1;
                yield post.save();
                return res.json(new PostDTO_1.PostDetailDTO(post, req.user, true));
            }
            catch (e) {
                console.log(e);
                return res.status(500).json({ message: 'Server error' });
            }
        });
    }
    getPosts(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { search = '', tags, users, status, sort = 'createdAt', sortValue = 'desc', } = req.query;
                const sortValueParsed = sortValue === 'desc' ? 'desc' : 'asc';
                const posts = yield Post_1.default.find(Object.assign(Object.assign(Object.assign({ title: new RegExp(String(search), 'i') }, (tags ? { tags: { $in: tags } } : {})), (users ? { user: users } : {})), (status ? { status } : {}))).sort({ [String(sort)]: sortValueParsed }).populate([
                    {
                        path: 'user',
                        populate: {
                            path: 'roles',
                        },
                    },
                    {
                        path: 'tags'
                    },
                    {
                        path: 'banReason',
                        populate: {
                            path: 'user',
                            populate: {
                                path: 'roles',
                            },
                        },
                    }
                ]).exec();
                const postsDTOS = posts.map(it => new PostDTO_1.PostListItemDTO(it, req.user, true));
                return res.json(postsDTOS);
            }
            catch (e) {
                console.log(e);
                return res.status(500).json({ message: 'Server error' });
            }
        });
    }
    banUser(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id } = req.params;
                const { text } = req.body;
                const { user: admin } = req;
                const user = yield User_1.default.findOne({ _id: id }).populate('roles').exec();
                if (!user) {
                    return res.status(400).json({ message: 'Пользователь не найден' });
                }
                if (user.roles.find((role) => role.value === 'ADMIN')) {
                    return res.status(403).json({ message: 'У вас нет прав для бана этого пользователя!' });
                }
                const banReason = new BanReason_1.default({ text, user: admin.id });
                yield banReason.save();
                const postBanReason = new BanReason_1.default({ text: 'Автор поста заблокирован', user: admin.id });
                yield postBanReason.save();
                const posts = yield Post_1.default.find({ user: id });
                if (posts) {
                    posts.forEach(post => {
                        post.status = Post_1.PostStatus.BANNED;
                        post.banReason = postBanReason._id;
                        post.save();
                    });
                }
                user.status = User_1.UserStatus.BANNED;
                user.banReason = banReason._id;
                yield user.save();
                return res.status(200).json({ message: 'Пользователь успешно заблокирован' });
            }
            catch (e) {
                console.log(e);
                res.status(400).json({ message: 'Ban error' });
            }
        });
    }
    unbanUser(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id } = req.params;
                const user = yield User_1.default.findOne({ _id: id });
                if (!user) {
                    return res.status(400).json({ message: 'Пользователь не найден' });
                }
                const posts = yield Post_1.default.find({ user: id }).populate('banReason').exec();
                if (posts) {
                    posts.forEach(post => {
                        var _a;
                        if (((_a = post.banReason) === null || _a === void 0 ? void 0 : _a.text) === USER_BAN_POST) {
                            post.status = Post_1.PostStatus.ACTIVE;
                            post.banReason = undefined;
                            post.save();
                        }
                    });
                }
                user.status = User_1.UserStatus.ACTIVE;
                user.banReason = undefined;
                yield user.save();
                return res.status(200).json({ message: 'Пользователь успешно разблокирован' });
            }
            catch (e) {
                console.log(e);
                res.status(400).json({ message: 'Unban error' });
            }
        });
    }
    banPost(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id } = req.params;
                const { text } = req.body;
                const { user: admin } = req;
                const post = yield Post_1.default.findOne({ _id: id });
                if (!post) {
                    return res.status(400).json({ message: 'Пост не найден' });
                }
                const banReason = new BanReason_1.default({ text, user: admin.id });
                yield banReason.save();
                post.status = Post_1.PostStatus.BANNED;
                post.banReason = banReason._id;
                yield post.save();
                return res.status(200).json({ message: 'Пост успешно заблокирован' });
            }
            catch (e) {
                console.log(e);
                res.status(400).json({ message: 'Ban error' });
            }
        });
    }
    unbanPost(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id } = req.params;
                const post = yield Post_1.default.findOne({ _id: id });
                if (!post) {
                    return res.status(400).json({ message: 'Пост не найден' });
                }
                post.status = Post_1.PostStatus.ACTIVE;
                post.banReason = undefined;
                yield post.save();
                return res.status(200).json({ message: 'Пост успешно разблокирован' });
            }
            catch (e) {
                console.log(e);
                res.status(400).json({ message: 'Unban error' });
            }
        });
    }
    deletePost(req, res) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const user = req.user;
                const { id } = req.params;
                const post = yield Post_1.default.findOne({ _id: id, user: user.id });
                if (!post) {
                    return res.status(400).json({ message: 'Пост не найден' });
                }
                if (post.status === Post_1.PostStatus.ACTIVE) {
                    return res.status(400).json({ message: 'Сначала заблокируйте пост' });
                }
                if (post.videoUrl) {
                    fs_1.default.unlinkSync((_a = post.videoUrl) === null || _a === void 0 ? void 0 : _a.replace(`http://${req.headers.host}/`, ''));
                }
                yield Promise.all(post.comments.map((it) => __awaiter(this, void 0, void 0, function* () {
                    yield Comment_1.default.findByIdAndDelete(it);
                })));
                yield post.remove();
                if (post.banReason) {
                    yield BanReason_1.default.findOneAndDelete({ _id: post.banReason });
                }
                return res.json({ message: 'Пост успешно удален' });
            }
            catch (e) {
                console.log(e);
                return res.status(500).json({ message: 'Server error' });
            }
        });
    }
    getUser(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id } = req.params;
                const user = yield User_1.default.findOne({ _id: id }).populate([
                    { path: 'roles' },
                    {
                        path: 'banReason',
                        populate: {
                            path: 'user',
                            populate: {
                                path: 'roles',
                            },
                        },
                    }
                ]).exec();
                if (!user) {
                    return res.status(400).json({ message: 'Пользователь не найден' });
                }
                return res.json(new UserDTO_1.default(user));
            }
            catch (e) {
                console.log(e);
                return res.status(500).json({ message: 'Server error' });
            }
        });
    }
    resetPasswordUser(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id } = req.params;
                const user = yield User_1.default.findById(id);
                if (!user || user.status === User_1.UserStatus.BANNED) {
                    return res.status(400).json({ message: 'Пользователь не найден' });
                }
                const newPassword = (0, PasswordServices_1.generatePassword)();
                const hashPassword = bcryptjs_1.default.hashSync(newPassword, 7);
                user.password = hashPassword;
                yield user.save();
                return res.json({ message: 'Письмо с паролем отправлено на почту' });
            }
            catch (e) {
                console.log(e);
                return res.status(500).json({ message: 'Server error' });
            }
        });
    }
}
exports.default = new AdminController();
