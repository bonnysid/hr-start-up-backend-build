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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const User_1 = __importStar(require("../models/User"));
const Role_1 = __importDefault(require("../models/Role"));
const express_validator_1 = require("express-validator");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const TokenService_1 = __importDefault(require("../services/TokenService"));
const UserDTO_1 = __importDefault(require("../dtos/UserDTO"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const config_1 = require("../config");
const IPService_1 = require("../services/IPService");
const Session_1 = __importDefault(require("../models/Session"));
class AuthController {
    registration(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const errors = (0, express_validator_1.validationResult)(req);
                if (!errors.isEmpty()) {
                    return res.status(400).json({ message: 'Ошибка при регистрации', errors });
                }
                const { email, password, firstName, lastName } = req.body;
                const candidate = yield User_1.default.findOne({ email: email.toLowerCase(), });
                if (candidate) {
                    return res.status(400).json({ message: 'Пользователь с таким именем уже существует' });
                }
                const hashPassword = bcryptjs_1.default.hashSync(password, 7);
                const userRole = yield Role_1.default.findOne({ value: 'USER' });
                const user = yield User_1.default.create({ email: email.toLowerCase(), firstName, lastName, password: hashPassword, roles: [userRole === null || userRole === void 0 ? void 0 : userRole._id] });
                yield user.save();
                const userDTO = new UserDTO_1.default(Object.assign(Object.assign({}, user.toObject()), { roles: [userRole] }));
                const tokens = TokenService_1.default.generateTokens(Object.assign({}, userDTO));
                res.json(tokens);
            }
            catch (e) {
                console.log(e);
                res.status(400).json({ message: 'Registration error' });
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
                const ipRes = IPService_1.IPService.getIp(req);
                if (ipRes.error) {
                    return res.status(400).json({ message: 'Введенны неверные параметры' });
                }
                const { ip, geo } = IPService_1.IPService.getIpInfo(ipRes.ip);
                const candidateSession = yield Session_1.default.findOne({ ip });
                if (!candidateSession || !candidate.sessions.map(it => it.toString()).includes(candidateSession._id.toString())) {
                    const session = new Session_1.default({ ip, city: geo === null || geo === void 0 ? void 0 : geo.city, country: geo === null || geo === void 0 ? void 0 : geo.country });
                    yield session.save();
                    candidate.sessions = [...candidate.sessions, session._id];
                    yield candidate.save();
                }
                const userDTO = new UserDTO_1.default(candidate);
                const tokens = TokenService_1.default.generateTokens(Object.assign({}, userDTO));
                res.json(tokens);
            }
            catch (e) {
                console.log(e);
                res.status(400).json({ message: 'Login error' });
            }
        });
    }
    refreshToken(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { refreshToken } = req.body;
                if (!refreshToken) {
                    return res.status(401).json({ message: 'Пользователь не авторизован' });
                }
                const decodedData = jsonwebtoken_1.default.verify(refreshToken, config_1.config.refreshSecret);
                if (typeof decodedData !== 'string') {
                    const { iat, exp } = decodedData, data = __rest(decodedData, ["iat", "exp"]);
                    const user = yield User_1.default.findOne({ _id: decodedData.id }).populate('sessions').exec();
                    if (!user) {
                        return res.status(401).json({ message: 'Пользователь не авторизован' });
                    }
                    if (user.status === User_1.UserStatus.BANNED) {
                        return res.status(401).json({ message: 'Пользователь заблокирован' });
                    }
                    const ipRes = IPService_1.IPService.getIp(req);
                    if (ipRes.ip) {
                        if (!user.sessions.find((it) => it.ip === ipRes.ip)) {
                            return res.status(401).json({ message: 'Пользователь не авторизован' });
                        }
                    }
                    const newTokens = TokenService_1.default.generateTokens(data);
                    return res.json(newTokens);
                }
            }
            catch (e) {
                console.log(e);
                return res.status(401).json({ message: 'Пользователь не авторизован' });
            }
        });
    }
    logout(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const user = req.user;
                const candidate = yield User_1.default.findOne({ _id: user.id }).populate('sessions').exec();
                if (!candidate) {
                    return res.status(401).json({ message: 'Пользователь не авторизован' });
                }
                const ipRes = IPService_1.IPService.getIp(req);
                if (ipRes.ip) {
                    const session = candidate.sessions.find((it) => it.ip === ipRes.ip);
                    if (!session) {
                        return res.status(401).json({ message: 'Пользователь не авторизован' });
                    }
                    else {
                        candidate.sessions = candidate.sessions.filter((it) => it.ip !== ipRes.ip).map(it => it._id);
                        yield candidate.save();
                        yield Session_1.default.findOneAndDelete({ _id: session._id });
                    }
                }
                return res.status(200).json({ message: 'Success' });
            }
            catch (e) {
                console.log(e);
                return res.status(500).json({ message: 'Server error' });
            }
        });
    }
    logoutSession(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { sessionId } = req.body;
                const user = req.user;
                const candidate = yield User_1.default.findOne({ _id: user.id });
                if (!candidate) {
                    return res.status(401).json({ message: 'Пользователь не авторизован' });
                }
                candidate.sessions = candidate.sessions.filter((it) => it !== sessionId);
                yield candidate.save();
                yield Session_1.default.findOneAndDelete({ _id: sessionId });
                return res.status(200).json({ message: 'Success' });
            }
            catch (e) {
                console.log(e);
                return res.status(500).json({ message: 'Server error' });
            }
        });
    }
}
exports.default = new AuthController();
