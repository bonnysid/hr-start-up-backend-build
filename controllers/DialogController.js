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
const Dialog_1 = __importDefault(require("../models/Dialog"));
const User_1 = __importDefault(require("../models/User"));
const SocketController_1 = require("./SocketController");
const Message_1 = __importDefault(require("../models/Message"));
const MessageDTO_1 = __importDefault(require("../dtos/MessageDTO"));
const DialogDTO_1 = __importStar(require("../dtos/DialogDTO"));
const WSError_1 = __importDefault(require("../errors/WSError"));
const express_validator_1 = require("express-validator");
class DialogController {
    createMessage(message) {
        return __awaiter(this, void 0, void 0, function* () {
            const { text, user, event, dialogId } = message;
            const dialog = yield Dialog_1.default.findById(dialogId);
            if (!dialog) {
                throw WSError_1.default.badRequest('Диалог не найден');
            }
            const dbMessage = yield Message_1.default.create({ text, user: user.id, event, read: false });
            dialog.messages = [...(dialog.messages || []), dbMessage._id];
            yield dialog.save();
            return new MessageDTO_1.default(Object.assign(Object.assign({}, dbMessage.toObject()), { dialogId, user }));
        });
    }
    getDialogInfo(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { dialogId } = req.params;
                const user = req.user;
                const dialog = yield Dialog_1.default.findOne({ users: user.id, _id: dialogId }).populate([{
                        path: 'messages',
                        populate: {
                            path: 'user'
                        }
                    }, { path: 'users' }]).exec();
                if (!dialog) {
                    return res.status(400).json({ message: 'Диалог не найден' });
                }
                yield Promise.all(dialog.messages.filter((it) => !it.read && it.user._id.toString() !== user.id).map((it) => __awaiter(this, void 0, void 0, function* () {
                    it.read = true;
                    yield it.save();
                })));
                return res.json(new DialogDTO_1.default(dialog));
            }
            catch (e) {
                console.log(e);
                return res.status(500).json({ message: 'Server error' });
            }
        });
    }
    getDialogs(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const user = req.user;
                const dialogs = yield Dialog_1.default.find({ users: user.id }).populate([{
                        path: 'messages',
                        populate: {
                            path: 'user'
                        }
                    }, { path: 'users' }]).exec();
                return res.json((dialogs || [])
                    .map(it => new DialogDTO_1.DialogListDTO(Object.assign(Object.assign({}, it.toObject()), { user: it.users.find(it => it._id.toString() !== user.id), lastMessage: it.messages[it.messages.length - 1], unreadableMessages: it.messages.filter((it) => {
                        return !it.read && it.user._id.toString() !== user.id;
                    }).length })))
                    .sort((a, b) => { var _a, _b; return Date.parse(((_a = b.lastMessage) === null || _a === void 0 ? void 0 : _a.updatedAt) || '') - Date.parse(((_b = a.lastMessage) === null || _b === void 0 ? void 0 : _b.updatedAt) || ''); }));
            }
            catch (e) {
                console.log(e);
                return res.status(500).json({ message: 'Server error' });
            }
        });
    }
    createDialogByRequest(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const errors = (0, express_validator_1.validationResult)(req);
                if (!errors.isEmpty()) {
                    return res.status(400).json({ message: 'Ошибка при создание диалогов', errors });
                }
                const { userId, text } = req.body;
                const { user } = req;
                const teammate = yield User_1.default.findById(userId);
                if (!teammate) {
                    return res.status(400).json({ message: 'Пользователь не найден' });
                }
                const candidateDialog = yield Dialog_1.default.findOne({ users: { $all: [userId, user.id] } });
                if (candidateDialog) {
                    const message = yield Message_1.default.create({ text, user: user.id, event: SocketController_1.MessageEvents.MESSAGE, read: false });
                    candidateDialog.messages = [...candidateDialog.messages, message._id];
                    yield candidateDialog.save();
                    const msg = new MessageDTO_1.default(Object.assign(Object.assign({}, message.toObject()), { user, dialogId: candidateDialog._id.toString() }));
                    (0, SocketController_1.broadCastMessage)(candidateDialog._id.toString(), Object.assign(Object.assign({}, msg), { event: SocketController_1.MessageEvents.MESSAGE }));
                    return res.json(new DialogDTO_1.default(Object.assign(Object.assign({}, candidateDialog.toObject()), { users: [user, teammate], messages: [Object.assign(Object.assign({}, message.toObject()), { user })] })));
                }
                else {
                    const message = yield Message_1.default.create({ text, user: user.id, event: SocketController_1.MessageEvents.MESSAGE, read: false });
                    const dialog = new Dialog_1.default({ messages: [], users: [userId, user.id] });
                    yield dialog.save();
                    dialog.messages = [message._id];
                    yield dialog.save();
                    yield (0, SocketController_1.implementDialogIdIF)(dialog._id.toString(), user.id, JSON.stringify(Object.assign(Object.assign({}, message.toObject()), { user, dialogId: dialog._id.toString() })));
                    return res.json(new DialogDTO_1.default(Object.assign(Object.assign({}, dialog.toObject()), { users: [user, teammate], messages: [Object.assign(Object.assign({}, message.toObject()), { user })] })));
                }
            }
            catch (e) {
                console.log(e);
                return res.status(500).json({ message: 'Server error' });
            }
        });
    }
}
exports.default = new DialogController();
