"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PostStatus = void 0;
const mongoose_1 = require("mongoose");
var PostStatus;
(function (PostStatus) {
    PostStatus["ACTIVE"] = "ACTIVE";
    PostStatus["BANNED"] = "BANNED";
    PostStatus["DELETED"] = "DELETED";
})(PostStatus = exports.PostStatus || (exports.PostStatus = {}));
const Post = new mongoose_1.Schema({
    title: {
        type: String,
        required: true,
        index: true,
    },
    description: {
        type: String,
        required: true,
    },
    shortDescription: {
        type: String,
        required: true,
    },
    videoUrl: {
        type: String,
    },
    status: {
        type: String,
        default: PostStatus.ACTIVE,
    },
    views: {
        type: mongoose_1.Schema.Types.Number,
        default: 0,
    },
    banReason: { type: mongoose_1.Schema.Types.ObjectId, ref: 'banReasons' },
    tags: [{ type: mongoose_1.Schema.Types.ObjectId, ref: 'tags' }],
    user: { type: mongoose_1.Schema.Types.ObjectId, ref: 'users', required: true },
    favoriteUsers: [{ type: mongoose_1.Schema.Types.ObjectId, ref: 'users' }],
    comments: [{ type: mongoose_1.Schema.Types.ObjectId, ref: 'comments' }],
}, { timestamps: true });
exports.default = (0, mongoose_1.model)('posts', Post);
