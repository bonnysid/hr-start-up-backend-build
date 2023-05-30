"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ComplaintMessageDTO = void 0;
const DefaultDTO_1 = __importDefault(require("./DefaultDTO"));
const UserDTO_1 = require("./UserDTO");
class DefaultMessageDTO extends DefaultDTO_1.default {
    constructor(model) {
        super(model);
        this.text = model.text;
        this.updatedAt = model.updatedAt;
        this.createdAt = model.createdAt;
        this.read = model.read;
        this.user = new UserDTO_1.UserCommentDto(model.user);
    }
}
class MessageDTO extends DefaultMessageDTO {
    constructor(model) {
        super(model);
        this.dialogId = model.dialogId;
    }
}
class ComplaintMessageDTO extends DefaultMessageDTO {
    constructor(model) {
        super(model);
        this.complaintId = model.complaintId;
    }
}
exports.ComplaintMessageDTO = ComplaintMessageDTO;
exports.default = MessageDTO;
