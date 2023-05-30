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
const User_1 = __importStar(require("../models/User"));
const Session_1 = __importDefault(require("../models/Session"));
const UserDTO_1 = __importDefault(require("../dtos/UserDTO"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const config_1 = require("../config");
const fs_1 = __importDefault(require("fs"));
const uuid_1 = require("uuid");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const express_validator_1 = require("express-validator");
const SessionDTO_1 = __importDefault(require("../dtos/SessionDTO"));
const IPService_1 = require("../services/IPService");
const EmailService_1 = __importDefault(require("../services/EmailService"));
const TokenService_1 = __importDefault(require("../services/TokenService"));
class UsersController {
    getUsers(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { search = '', } = req.query;
                const user = req.user;
                const users = yield User_1.default.find({
                    _id: { $ne: user.id },
                    $and: [
                        { email: new RegExp(String(search), 'i') },
                    ],
                    status: { $not: new RegExp(User_1.UserStatus.BANNED) }
                }).populate('roles').exec();
                const userDTOS = users.map(it => new UserDTO_1.default(it));
                return res.json(userDTOS);
            }
            catch (e) {
                console.log(e);
                res.status(400).json({ message: 'Users error' });
            }
        });
    }
    getUser(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id } = req.params;
                const user = yield User_1.default.findOne({ _id: id, status: { $not: new RegExp(User_1.UserStatus.BANNED) } }).populate('roles').exec();
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
    getMe(req, res) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const token = (_a = req.headers.authorization) === null || _a === void 0 ? void 0 : _a.split(' ')[1];
                if (!token) {
                    return res.status(401).json({ message: 'Пользователь не авторизован' });
                }
                const decodedData = jsonwebtoken_1.default.verify(token, config_1.config.secret);
                const user = yield User_1.default.findOne({ _id: decodedData.id }).populate('roles').exec();
                return res.json(new UserDTO_1.default(user));
            }
            catch (e) {
                console.log(e);
                return res.status(401).json({ message: 'Пользователь не авторизован' });
            }
        });
    }
    changePassword(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const errors = (0, express_validator_1.validationResult)(req);
                if (!errors.isEmpty()) {
                    return res.status(400).json({ message: 'Ошибка при смене пароля', errors });
                }
                const { password, newPassword } = req.body;
                const user = req.user;
                const candidate = yield User_1.default.findOne({ _id: user.id });
                if (!candidate) {
                    return res.status(400).json({ message: 'Пользователь не найден' });
                }
                if (candidate.status === User_1.UserStatus.BANNED) {
                    return res.status(401).json({ message: 'Пользователь заблокирован' });
                }
                const validPassword = bcryptjs_1.default.compareSync(password, candidate.password);
                if (!validPassword) {
                    return res.status(400).json({ message: 'Введенны неверные параметры' });
                }
                const hashPassword = bcryptjs_1.default.hashSync(newPassword, 7);
                const ipRes = IPService_1.IPService.getIp(req);
                const session = yield Session_1.default.findOne({ ip: ipRes.ip });
                candidate.password = hashPassword;
                if (session) {
                    candidate.sessions = [session._id];
                }
                yield candidate.save();
                return res.json({ message: 'Пароль успешно изменен!' });
            }
            catch (e) {
                console.log(e);
                return res.status(500).json({ message: 'Server error' });
            }
        });
    }
    changeInfo(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const errors = (0, express_validator_1.validationResult)(req);
                if (!errors.isEmpty()) {
                    return res.status(400).json({ message: 'Ошибка при смене информации', errors });
                }
                const { firstName, lastName } = req.body;
                const user = req.user;
                const candidate = yield User_1.default.findOne({ _id: user.id }).populate('roles').exec();
                if (!candidate) {
                    return res.status(400).json({ message: 'Пользователь не найден' });
                }
                if (candidate.status === User_1.UserStatus.BANNED) {
                    return res.status(401).json({ message: 'Пользователь заблокирован' });
                }
                candidate.firstName = firstName;
                candidate.lastName = lastName;
                yield candidate.save();
                return res.json({ message: 'Информация успешно изменена!', user: new UserDTO_1.default(candidate) });
            }
            catch (e) {
                console.log(e);
                return res.status(500).json({ message: 'Server error' });
            }
        });
    }
    uploadAvatar(req, res) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const file = req.file;
                const user = req.user;
                if (!file) {
                    return res.status(400).send({ message: 'Нет аватара для загрузки' });
                }
                const fileName = user.id;
                const fileExtension = file.originalname.split('.').pop();
                const newFileName = `${(0, uuid_1.v4)()}.${fileName}.${fileExtension}`;
                const newFilePath = `avatars/${newFileName}`;
                const publicUrl = `http://${req.headers.host}/avatars/${newFileName}`;
                const userFromDB = yield User_1.default.findOne({ _id: user.id });
                if (userFromDB) {
                    if (userFromDB.avatar) {
                        fs_1.default.unlinkSync((_a = userFromDB.avatar) === null || _a === void 0 ? void 0 : _a.replace(`http://${req.headers.host}/`, ''));
                    }
                    userFromDB.avatar = publicUrl;
                    yield userFromDB.save();
                }
                fs_1.default.renameSync(file.path, newFilePath);
                return res.status(200).send({ message: 'Фото обновлено', url: publicUrl });
            }
            catch (e) {
                console.log(e);
                return res.status(500).json({ message: 'Server error' });
            }
        });
    }
    getSessions(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const user = req.user;
                const candidate = yield User_1.default.findOne({ _id: user.id }).populate('sessions').exec();
                if (!candidate) {
                    return res.status(400).json({ message: 'Пользователь не найден' });
                }
                if (candidate.status === User_1.UserStatus.BANNED) {
                    return res.status(401).json({ message: 'Пользователь заблокирован' });
                }
                const ipRes = IPService_1.IPService.getIp(req);
                return res.status(200).json(candidate.sessions.map((it) => new SessionDTO_1.default(it, it.ip === ipRes.ip)));
            }
            catch (e) {
                console.log(e);
                return res.status(500).json({ message: 'Server error' });
            }
        });
    }
    changeEmail(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { email } = req.body;
                const { user: currentUser } = req;
                const user = yield User_1.default.findById(currentUser.id);
                if (!user) {
                    return res.status(400).json({ message: 'Пользователь не найден' });
                }
                const { code, token } = TokenService_1.default.generateCodeToken();
                user.tempEmail = email;
                user.tempEmailCode = token;
                yield user.save();
                yield EmailService_1.default.sendMail(email, `
        <div>${code}</div>
      `, 'Код для смены почты');
                return res.json({ message: 'Код для подтверждения отправлен на новую почту' });
            }
            catch (e) {
                console.log(e);
                return res.status(500).json({ message: 'Server error' });
            }
        });
    }
    sendVerificationEmailCode(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { user: currentUser } = req;
                const user = yield User_1.default.findById(currentUser.id);
                if (!user) {
                    return res.status(400).json({ message: 'Пользователь не найден' });
                }
                const { code, token } = TokenService_1.default.generateCodeToken();
                user.tempEmailCode = token;
                yield user.save();
                yield EmailService_1.default.sendMail(user.email, `
        <div>${code}</div>
      `, 'Код для подтверждения почты');
                return res.json({ message: 'Код для подтверждения отправлен на новую почту' });
            }
            catch (e) {
                console.log(e);
                return res.status(500).json({ message: 'Server error' });
            }
        });
    }
    confirmEmail(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { code } = req.body;
                const { user: currentUser } = req;
                const user = yield User_1.default.findById(currentUser.id);
                if (!user) {
                    return res.status(400).json({ message: 'Пользователь не найден' });
                }
                if (!user.tempEmailCode) {
                    return res.status(400).json({ message: 'Код не верный' });
                }
                try {
                    const correctCode = TokenService_1.default.getCode(user.tempEmailCode);
                    if (correctCode === code) {
                        user.tempEmailCode = '';
                        user.isConfirmedEmail = true;
                        yield user.save();
                    }
                    else {
                        return res.status(400).json({ message: 'Код не верный' });
                    }
                }
                catch (e) {
                    user.tempEmailCode = '';
                    return res.status(400).json({ message: 'Код не верный' });
                }
                return res.json({ message: 'Почта успешно подтверждена' });
            }
            catch (e) {
                console.log(e);
                return res.status(500).json({ message: 'Server error' });
            }
        });
    }
    changeEmailConfirm(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { code } = req.body;
                const { user: currentUser } = req;
                const user = yield User_1.default.findById(currentUser.id);
                if (!user) {
                    return res.status(400).json({ message: 'Пользователь не найден' });
                }
                if (!user.tempEmailCode) {
                    return res.status(400).json({ message: 'Код не верный' });
                }
                try {
                    const correctCode = TokenService_1.default.getCode(user.tempEmailCode);
                    if (correctCode === code && user.tempEmail) {
                        user.email = user.tempEmail;
                        user.tempEmail = '';
                        user.tempEmailCode = '';
                        user.isConfirmedEmail = true;
                        yield user.save();
                    }
                    else {
                        return res.status(400).json({ message: 'Код не верный' });
                    }
                }
                catch (e) {
                    user.tempEmailCode = '';
                    return res.status(400).json({ message: 'Код не верный' });
                }
                return res.json({ message: 'Почта успешно изменена' });
            }
            catch (e) {
                console.log(e);
                return res.status(500).json({ message: 'Server error' });
            }
        });
    }
}
exports.default = new UsersController();
