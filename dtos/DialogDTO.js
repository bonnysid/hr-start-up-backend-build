"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DialogListDTO = void 0;
const DefaultDTO_1 = __importDefault(require("./DefaultDTO"));
const UserDTO_1 = require("./UserDTO");
const MessageDTO_1 = __importDefault(require("./MessageDTO"));
class DialogDTO extends DefaultDTO_1.default {
    constructor(model) {
        super(model);
        this.users = model.users.map((it) => new UserDTO_1.UserCommentDto(it));
        this.messages = model.messages.map((it) => new MessageDTO_1.default(Object.assign(Object.assign({}, ('toObject' in it ? it.toObject() : it)), { dialogId: this.id })));
    }
}
class DialogListDTO extends DefaultDTO_1.default {
    constructor(model) {
        super(model);
        this.user = new UserDTO_1.UserCommentDto(model.user);
        this.unreadableMessages = model.unreadableMessages;
        this.lastMessage = model.lastMessage ? new MessageDTO_1.default(Object.assign(Object.assign({}, model.lastMessage.toObject()), { dialogId: this.id })) : undefined;
    }
}
exports.DialogListDTO = DialogListDTO;
exports.default = DialogDTO;
