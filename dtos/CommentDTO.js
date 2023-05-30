"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const DefaultDTO_1 = __importDefault(require("./DefaultDTO"));
const UserDTO_1 = require("./UserDTO");
class CommentDTO extends DefaultDTO_1.default {
    constructor(model) {
        super(model);
        this.text = model.text;
        this.updatedAt = model.updatedAt;
        this.createdAt = model.createdAt;
        this.user = new UserDTO_1.UserCommentDto(model.user);
    }
}
exports.default = CommentDTO;
