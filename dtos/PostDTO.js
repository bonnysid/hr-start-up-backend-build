"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PostDetailDTO = exports.PostListItemDTO = exports.PostShortDTO = void 0;
const DefaultDTO_1 = __importDefault(require("./DefaultDTO"));
const UserDTO_1 = __importDefault(require("./UserDTO"));
const TagDTO_1 = __importDefault(require("./TagDTO"));
const Post_1 = require("../models/Post");
const CommentDTO_1 = __importDefault(require("./CommentDTO"));
const Comment_1 = require("../models/Comment");
const BanReasonDTO_1 = __importDefault(require("../dtos/BanReasonDTO"));
class PostShortDTO extends DefaultDTO_1.default {
    constructor(model) {
        super(model);
        this.title = model.title;
    }
}
exports.PostShortDTO = PostShortDTO;
class PostDTO extends DefaultDTO_1.default {
    constructor(model, isAdmin) {
        var _a;
        super(model);
        this.title = model.title;
        this.videoUrl = model.videoUrl;
        this.status = model.status;
        this.description = model.description;
        this.updatedAt = model.updatedAt;
        this.createdAt = model.createdAt;
        this.views = model.views;
        this.favoriteCount = ((_a = model.favoriteUsers) === null || _a === void 0 ? void 0 : _a.length) || 0;
        this.shortDescription = model.shortDescription;
        this.user = new UserDTO_1.default(model.user);
        this.tags = model.tags.map((tag) => new TagDTO_1.default(tag));
        this.banReason = this.status === Post_1.PostStatus.BANNED ? new BanReasonDTO_1.default(model.banReason, isAdmin) : undefined;
    }
}
class PostListItemDTO extends PostDTO {
    constructor(model, user, isAdmin) {
        var _a, _b;
        super(model, isAdmin);
        this.commentsCount = ((_a = model.comments) === null || _a === void 0 ? void 0 : _a.filter((it) => isAdmin || it.status === Comment_1.CommentStatus.ACTIVE).length) || 0;
        this.isFavorite = ((_b = model.favoriteUsers) === null || _b === void 0 ? void 0 : _b.map((it) => it.toString()).includes(user.id)) || false;
    }
}
exports.PostListItemDTO = PostListItemDTO;
class PostDetailDTO extends PostListItemDTO {
    constructor(model, user, isAdmin) {
        super(model, user, isAdmin);
        this.comments = model.comments.filter((it) => isAdmin || it.status === Comment_1.CommentStatus.ACTIVE).map((it) => new CommentDTO_1.default(it));
    }
}
exports.PostDetailDTO = PostDetailDTO;
exports.default = PostDTO;
