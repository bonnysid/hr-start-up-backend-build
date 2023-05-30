"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserCommentDto = void 0;
const RoleDTO_1 = __importDefault(require("./RoleDTO"));
const DefaultDTO_1 = __importDefault(require("./DefaultDTO"));
const User_1 = require("../models/User");
const BanReasonDTO_1 = __importDefault(require("./BanReasonDTO"));
class UserCommentDto extends DefaultDTO_1.default {
    constructor(model) {
        super(model);
        this.email = model.email;
        this.firstName = model.firstName;
        this.lastName = model.lastName;
        this.avatar = model.avatar;
    }
}
exports.UserCommentDto = UserCommentDto;
class UserDTO extends UserCommentDto {
    constructor(model, isAdmin) {
        super(model);
        this.isConfirmedEmail = model.isConfirmedEmail;
        this.phone = model.phone;
        this.updatedAt = model.updatedAt;
        this.createdAt = model.createdAt;
        this.status = model.status || User_1.UserStatus.ACTIVE;
        this.roles = model.roles.map((it) => new RoleDTO_1.default(it));
        this.banReason = isAdmin && model.banReason ? new BanReasonDTO_1.default(model.banReason, isAdmin) : undefined;
    }
}
exports.default = UserDTO;
