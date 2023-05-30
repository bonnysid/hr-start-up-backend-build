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
const Complaint_1 = __importStar(require("../models/Complaint"));
const Post_1 = __importStar(require("../models/Post"));
const User_1 = __importStar(require("../models/User"));
const ComplaintDTO_1 = __importStar(require("../dtos/ComplaintDTO"));
const SocketController_1 = require("../controllers/SocketController");
const Complaint_2 = __importDefault(require("../models/Complaint"));
const MessageDTO_1 = require("../dtos/MessageDTO");
const WSError_1 = __importDefault(require("../errors/WSError"));
const Message_1 = __importDefault(require("../models/Message"));
class ComplaintController {
    getComplaints(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { status, user, type, sort = 'createdAt', sortValue = 'desc', } = req.query;
                const { user: currentUser } = req;
                const sortValueParsed = sortValue === 'desc' ? 'desc' : 'asc';
                const complaints = yield Complaint_1.default.find(Object.assign(Object.assign(Object.assign({}, (type ? { type } : {})), (user ? { user } : {})), (status ? { status } : {}))).populate([
                    {
                        path: 'author'
                    },
                    {
                        path: 'userId'
                    },
                    {
                        path: 'postId'
                    },
                    {
                        path: 'whoResolve'
                    },
                    {
                        path: 'messages',
                        populate: {
                            path: 'user'
                        }
                    }
                ]).sort({ [String(sort)]: sortValueParsed }).exec();
                return res.json(complaints.map(it => new ComplaintDTO_1.default(Object.assign(Object.assign({}, it.toObject()), { unreadableMessages: it.messages.filter((it) => {
                        return !it.read && it.user._id.toString() !== currentUser.id;
                    }).length }))));
            }
            catch (e) {
                console.log(e);
                return res.status(500).json({ message: 'Server error' });
            }
        });
    }
    getComplaint(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id } = req.params;
                const { user } = req;
                const complaint = yield Complaint_1.default.findOne({
                    _id: id
                }).populate([
                    {
                        path: 'author'
                    },
                    {
                        path: 'userId'
                    },
                    {
                        path: 'postId'
                    },
                    {
                        path: 'whoResolve'
                    },
                    {
                        path: 'messages',
                        populate: {
                            path: 'user'
                        }
                    }
                ]).exec();
                if (!complaint) {
                    return res.status(400).json({ message: 'Жалоба не найдена' });
                }
                if (complaint.author._id.toString() !== user.id && !user.roles.find((role) => {
                    return ['ADMIN', 'MODERATOR'].includes(role.value);
                })) {
                    return res.status(400).json({ message: 'Жалоба не найдена' });
                }
                yield Promise.all(complaint.messages.filter((it) => !it.read && it.user._id.toString() !== user.id).map((it) => __awaiter(this, void 0, void 0, function* () {
                    it.read = true;
                    yield it.save();
                })));
                return res.json(new ComplaintDTO_1.ComplaintDetailDTO(complaint));
            }
            catch (e) {
                console.log(e);
                return res.status(500).json({ message: 'Server error' });
            }
        });
    }
    resolveComplaint(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id } = req.params;
                const { user } = req;
                const complaint = yield Complaint_1.default.findById(id);
                if (!complaint) {
                    return res.status(400).json({ message: 'Жалоба не найдена' });
                }
                if ([Complaint_1.ComplaintStatus.RESOLVED, Complaint_1.ComplaintStatus.CLOSED].includes(complaint.status)) {
                    return res.status(400).json({ message: 'Жалоба уже закрыта или решена' });
                }
                complaint.status = Complaint_1.ComplaintStatus.RESOLVED;
                complaint.whoResolve = user.id;
                yield complaint.save();
                (0, SocketController_1.broadCastMessage)(complaint.author.toString(), { event: SocketController_1.MessageEvents.RESOLVE_COMPLAIN, complaintId: id, status: Complaint_1.ComplaintStatus.RESOLVED });
                return res.json({ message: 'Жалоба успешно решена' });
            }
            catch (e) {
                console.log(e);
                return res.status(500).json({ message: 'Server error' });
            }
        });
    }
    closeComplaint(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id } = req.params;
                const { user } = req;
                const complaint = yield Complaint_1.default.findById(id);
                if (!complaint) {
                    return res.status(400).json({ message: 'Жалоба не найдена' });
                }
                if ([Complaint_1.ComplaintStatus.RESOLVED, Complaint_1.ComplaintStatus.CLOSED].includes(complaint.status)) {
                    return res.status(400).json({ message: 'Жалоба уже закрыта или решена' });
                }
                complaint.status = Complaint_1.ComplaintStatus.CLOSED;
                complaint.whoResolve = user.id;
                yield complaint.save();
                (0, SocketController_1.broadCastMessage)(complaint.author.toString(), { event: SocketController_1.MessageEvents.CLOSE_COMPLAIN, complaintId: id, status: Complaint_1.ComplaintStatus.CLOSED });
                return res.json({ message: 'Жалоба успешно закрыта' });
            }
            catch (e) {
                console.log(e);
                return res.status(500).json({ message: 'Server error' });
            }
        });
    }
    unresolveComplaint(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id } = req.params;
                const complaint = yield Complaint_1.default.findById(id);
                if (!complaint) {
                    return res.status(400).json({ message: 'Жалоба не найдена' });
                }
                complaint.status = Complaint_1.ComplaintStatus.UNRESOLVED;
                complaint.whoResolve = undefined;
                yield complaint.save();
                return res.json({ message: 'Жалоба успешно открыта' });
            }
            catch (e) {
                console.log(e);
                return res.status(500).json({ message: 'Server error' });
            }
        });
    }
    createMessage(message) {
        return __awaiter(this, void 0, void 0, function* () {
            const { text, user, event, complaintId } = message;
            const complaint = yield Complaint_1.default.findById(complaintId);
            if (!complaint) {
                throw WSError_1.default.badRequest('Жалоба не найдена');
            }
            if (complaint.author.toString() !== user.id && !user.roles.find((role) => {
                return ['ADMIN', 'MODERATOR'].includes(role.value);
            })) {
                throw WSError_1.default.badRequest('Жалоба не найдена');
            }
            const dbMessage = yield Message_1.default.create({ text, user: user.id, event, read: false });
            complaint.messages = [...(complaint.messages || []), dbMessage._id];
            yield complaint.save();
            return new MessageDTO_1.ComplaintMessageDTO(Object.assign(Object.assign({}, dbMessage.toObject()), { complaintId: complaint._id.toString(), user }));
        });
    }
    getMyComplaints(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { status, type, sort = 'createdAt', sortValue = 'desc', } = req.query;
                const sortValueParsed = sortValue === 'desc' ? 'desc' : 'asc';
                const { user } = req;
                const complaints = yield Complaint_1.default.find(Object.assign(Object.assign({ author: user.id }, (type ? { type } : {})), (status ? { status } : {}))).populate([
                    {
                        path: 'author'
                    },
                    {
                        path: 'userId'
                    },
                    {
                        path: 'postId'
                    },
                    {
                        path: 'whoResolve'
                    },
                    {
                        path: 'messages',
                        populate: {
                            path: 'user'
                        }
                    }
                ]).sort({ [String(sort)]: sortValueParsed }).exec();
                return res.json(complaints.map(it => new ComplaintDTO_1.UserComplaintDTO(Object.assign(Object.assign({}, it.toObject()), { unreadableMessages: it.messages.filter((it) => {
                        return !it.read && it.user._id.toString() !== user.id;
                    }).length }))));
            }
            catch (e) {
                console.log(e);
                return res.status(500).json({ message: 'Server error' });
            }
        });
    }
    createPostComplaint(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { text, postId } = req.body;
                const { user } = req;
                const post = yield Post_1.default.findOne({ _id: postId, status: Post_1.PostStatus.ACTIVE });
                if (!post) {
                    return res.status(400).json({ message: 'Пост не найден или уже заблокирован' });
                }
                const complaint = new Complaint_2.default({ text, author: user.id, postId, type: Complaint_1.ComplaintType.POST, status: Complaint_1.ComplaintStatus.UNRESOLVED });
                yield complaint.save();
                yield (0, SocketController_1.implementComplaintIdIF)(complaint._id.toString());
                return res.json(new ComplaintDTO_1.UserComplaintDTO(Object.assign(Object.assign({}, complaint.toObject()), { postId: post, author: user })));
            }
            catch (e) {
                console.log(e);
                return res.status(500).json({ message: 'Server error' });
            }
        });
    }
    createUserComplaint(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { text, userId } = req.body;
                const { user } = req;
                const candidate = yield User_1.default.findOne({ _id: userId, status: User_1.UserStatus.ACTIVE });
                if (!candidate) {
                    return res.status(400).json({ message: 'Пользователь не найден или уже заблокирован' });
                }
                const complaint = new Complaint_2.default({ text, author: user.id, userId, type: Complaint_1.ComplaintType.USER, status: Complaint_1.ComplaintStatus.UNRESOLVED });
                yield complaint.save();
                yield (0, SocketController_1.implementComplaintIdIF)(complaint._id.toString());
                return res.json(new ComplaintDTO_1.UserComplaintDTO(Object.assign(Object.assign({}, complaint.toObject()), { userId: candidate, author: user })));
            }
            catch (e) {
                console.log(e);
                return res.status(500).json({ message: 'Server error' });
            }
        });
    }
}
exports.default = new ComplaintController();
