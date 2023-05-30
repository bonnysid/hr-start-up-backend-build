"use strict";
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
exports.roleMiddleware = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const config_1 = require("../config");
const User_1 = __importDefault(require("../models/User"));
const roleMiddleware = (roles) => {
    return (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        if (req.method === 'OPTIONS') {
            next();
        }
        try {
            const token = (_a = req.headers.authorization) === null || _a === void 0 ? void 0 : _a.split(' ')[1];
            if (!token) {
                return res.status(401).json({ message: 'Пользователь не авторизован' });
            }
            const decodedData = jsonwebtoken_1.default.verify(token, config_1.config.secret);
            const user = yield User_1.default.findOne({ _id: decodedData.id }).populate('roles').exec();
            let hasRole = false;
            user.roles.forEach((role) => {
                if (roles.includes(role.value)) {
                    hasRole = true;
                }
            });
            if (!hasRole) {
                return res.status(403).json({ message: 'У вас нет доступа' });
            }
            next();
        }
        catch (e) {
            console.log(e);
            return res.status(401).json({ message: 'Пользователь не авторизован' });
        }
    });
};
exports.roleMiddleware = roleMiddleware;
