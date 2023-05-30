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
exports.implementComplaintIdIF = exports.implementDialogIdIF = exports.broadCastMessage = exports.wss = exports.MessageEvents = void 0;
const ws_1 = __importDefault(require("ws"));
const DialogController_1 = __importDefault(require("./DialogController"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const config_1 = require("../config");
const Dialog_1 = __importDefault(require("../models/Dialog"));
const WSError_1 = __importDefault(require("../errors/WSError"));
const Message_1 = __importDefault(require("../models/Message"));
const MessageDTO_1 = __importDefault(require("../dtos/MessageDTO"));
const ComplaintController_1 = __importDefault(require("../controllers/ComplaintController"));
const Complaint_1 = __importDefault(require("../models/Complaint"));
var MessageEvents;
(function (MessageEvents) {
    MessageEvents["CONNECTION"] = "connection";
    MessageEvents["MESSAGE"] = "message";
    MessageEvents["COMPLAINT_MESSAGE"] = "complaintMessage";
    MessageEvents["READ_MESSAGE"] = "readMessage";
    MessageEvents["CLOSE_COMPLAIN"] = "closeComplain";
    MessageEvents["RESOLVE_COMPLAIN"] = "resolveComplain";
    MessageEvents["ERROR"] = "error";
    MessageEvents["DELETE_MESSAGE"] = "deleteMessage";
})(MessageEvents = exports.MessageEvents || (exports.MessageEvents = {}));
const checkUser = (token) => {
    try {
        if (!token) {
            throw WSError_1.default.unauthorized();
        }
        const decodedData = jsonwebtoken_1.default.verify(token, config_1.config.secret);
        return decodedData;
    }
    catch (e) {
        throw WSError_1.default.unauthorized();
    }
};
exports.wss = new ws_1.default.Server({
    port: 4000,
}, () => console.log(`Websocket was started on port: ${4000}`));
const broadCastMessage = (id, message) => {
    exports.wss.clients.forEach((client) => {
        var _a;
        if (client.id === id) {
            client.send(JSON.stringify(message));
        }
        if ((_a = client.dialogs) === null || _a === void 0 ? void 0 : _a.includes(id)) {
            client.send(JSON.stringify(message));
        }
    });
};
exports.broadCastMessage = broadCastMessage;
const getDialogsIds = (userId, fromAdmin) => __awaiter(void 0, void 0, void 0, function* () {
    const dialogs = yield Dialog_1.default.find({ users: userId });
    const complaints = yield Complaint_1.default.find(Object.assign({}, (fromAdmin ? {} : { author: userId })));
    return [...dialogs.map(it => it.id), ...complaints.map(it => it.id)];
});
const implementDialogIdIF = (dialogId, currentUserId, message) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const dialogs = yield Dialog_1.default.find({ users: currentUserId });
    const needDialog = dialogs.find(it => Boolean(it.users.find(it => it.toString() !== currentUserId)));
    const secondUser = (_a = needDialog === null || needDialog === void 0 ? void 0 : needDialog.users.find(it => it.toString() !== currentUserId)) === null || _a === void 0 ? void 0 : _a.toString();
    if (secondUser) {
        let client;
        let currentClient;
        exports.wss.clients.forEach((it) => {
            if (it.id === secondUser) {
                client = it;
            }
            if (it.id === currentUserId) {
                currentClient = it;
            }
        });
        if (client) {
            client.dialogs = [...(client.dialogs || []), dialogId];
            client.send(message);
        }
        if (currentClient && currentClient) {
            currentClient.dialogs = [...(currentClient.dialogs || []), dialogId];
        }
    }
});
exports.implementDialogIdIF = implementDialogIdIF;
const implementComplaintIdIF = (complaintId) => __awaiter(void 0, void 0, void 0, function* () {
    const complaint = yield Complaint_1.default.findById(complaintId);
    if (complaint) {
        let client;
        exports.wss.clients.forEach((it) => {
            if (it.id === complaint.author._id) {
                client = it;
            }
        });
        if (client) {
            client.dialogs = [...(client.dialogs || []), complaintId];
        }
    }
});
exports.implementComplaintIdIF = implementComplaintIdIF;
const readMessage = (data) => __awaiter(void 0, void 0, void 0, function* () {
    yield Message_1.default.findByIdAndUpdate(data.messageId, {
        read: true,
    });
});
const deleteMessage = (data, userId) => __awaiter(void 0, void 0, void 0, function* () {
    const message = yield Message_1.default.findOne({ _id: data.messageId, user: userId });
    if (!message) {
        throw WSError_1.default.badRequest('Сообщение не найдено');
    }
    yield message.remove();
    const dialog = yield Dialog_1.default.findOne({ messages: data.messageId });
    if (dialog) {
        dialog.messages = dialog.messages.filter(it => it.toString() !== data.messageId);
        yield dialog.save();
        const lastMessage = yield Message_1.default.findById(dialog.messages[dialog.messages.length - 1].toString()).populate('user').exec();
        return {
            event: MessageEvents.DELETE_MESSAGE,
            messageId: data.messageId,
            lastMessage: new MessageDTO_1.default(lastMessage),
            dialogId: dialog._id.toString(),
        };
    }
    return {
        event: MessageEvents.DELETE_MESSAGE,
        messageId: data.messageId,
    };
});
exports.wss.on('connection', (ws) => __awaiter(void 0, void 0, void 0, function* () {
    ws.on('error', console.error);
    ws.on(MessageEvents.MESSAGE, (message) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const { token, event, fromAdmin } = JSON.parse(message);
            const decodedData = checkUser(token);
            let dataMessage;
            switch (event) {
                case MessageEvents.MESSAGE:
                    dataMessage = JSON.parse(message);
                    const msgFromDB = yield DialogController_1.default.createMessage(Object.assign(Object.assign({}, dataMessage), { user: decodedData }));
                    (0, exports.broadCastMessage)(dataMessage.dialogId, Object.assign(Object.assign({}, msgFromDB), { event: MessageEvents.MESSAGE }));
                    break;
                case MessageEvents.COMPLAINT_MESSAGE:
                    dataMessage = JSON.parse(message);
                    const complaintMessage = yield ComplaintController_1.default.createMessage(Object.assign(Object.assign({}, dataMessage), { user: decodedData }));
                    (0, exports.broadCastMessage)(dataMessage.complaintId, Object.assign(Object.assign({}, complaintMessage), { event: MessageEvents.COMPLAINT_MESSAGE }));
                    break;
                case MessageEvents.CONNECTION:
                    ws.id = decodedData.id;
                    const ids = yield getDialogsIds(ws.id, fromAdmin);
                    ws.dialogs = ids || [];
                    (0, exports.broadCastMessage)(ws.id, { text: 'Success' });
                    break;
                case MessageEvents.READ_MESSAGE:
                    dataMessage = JSON.parse(message);
                    yield readMessage(dataMessage);
                    break;
                case MessageEvents.DELETE_MESSAGE:
                    dataMessage = JSON.parse(message);
                    const res = yield deleteMessage(dataMessage, decodedData.id);
                    if (res.dialogId) {
                        (0, exports.broadCastMessage)(res.dialogId, res);
                    }
                    break;
            }
        }
        catch (e) {
            if (e instanceof WSError_1.default) {
                (0, exports.broadCastMessage)(ws.id, { event: e.event, message: e.message, status: e.status });
            }
            else {
                (0, exports.broadCastMessage)(ws.id, { event: MessageEvents.ERROR, message: 'Server error', status: 500 });
            }
        }
    }));
}));
