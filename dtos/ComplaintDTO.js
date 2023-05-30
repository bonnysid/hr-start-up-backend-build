"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserComplaintDTO = exports.ComplaintDetailDTO = void 0;
const UserDTO_1 = require("../dtos/UserDTO");
const DefaultDTO_1 = __importDefault(require("../dtos/DefaultDTO"));
const Complaint_1 = require("../models/Complaint");
const PostDTO_1 = require("../dtos/PostDTO");
const MessageDTO_1 = __importDefault(require("../dtos/MessageDTO"));
class ComplaintDTO extends DefaultDTO_1.default {
    constructor(model) {
        super(model);
        this.text = model.text;
        this.author = new UserDTO_1.UserCommentDto(model.author);
        this.status = model.status;
        this.type = model.type;
        this.updatedAt = model.updatedAt;
        this.createdAt = model.createdAt;
        this.unreadableMessages = model.unreadableMessages;
        if ([Complaint_1.ComplaintStatus.CLOSED, Complaint_1.ComplaintStatus.RESOLVED].includes(this.status)) {
            this.whoResolve = new UserDTO_1.UserCommentDto(model.whoResolve);
        }
        switch (this.type) {
            case Complaint_1.ComplaintType.USER:
                this.user = new UserDTO_1.UserCommentDto(model.userId);
                break;
            case Complaint_1.ComplaintType.POST:
                this.post = new PostDTO_1.PostShortDTO(model.postId);
                break;
        }
    }
}
class ComplaintDetailDTO extends ComplaintDTO {
    constructor(model) {
        super(model);
        this.messages = [];
        this.messages = model.messages.map((it) => new MessageDTO_1.default(Object.assign(Object.assign({}, ('toObject' in it ? it.toObject() : it)), { complaintId: this.id })));
    }
}
exports.ComplaintDetailDTO = ComplaintDetailDTO;
class UserComplaintDTO extends DefaultDTO_1.default {
    constructor(model) {
        super(model);
        this.text = model.text;
        this.author = new UserDTO_1.UserCommentDto(model.author);
        this.status = model.status;
        this.type = model.type;
        this.updatedAt = model.updatedAt;
        this.createdAt = model.createdAt;
        this.unreadableMessages = model.unreadableMessages;
        switch (this.type) {
            case Complaint_1.ComplaintType.USER:
                this.user = new UserDTO_1.UserCommentDto(model.userId);
                break;
            case Complaint_1.ComplaintType.POST:
                this.post = new PostDTO_1.PostShortDTO(model.postId);
                break;
        }
    }
}
exports.UserComplaintDTO = UserComplaintDTO;
exports.default = ComplaintDTO;
