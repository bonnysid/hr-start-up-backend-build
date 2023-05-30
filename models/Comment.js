"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommentStatus = void 0;
const mongoose_1 = require("mongoose");
var CommentStatus;
(function (CommentStatus) {
    CommentStatus["ACTIVE"] = "ACTIVE";
    CommentStatus["BANNED"] = "BANNED";
    CommentStatus["DELETED"] = "DELETED";
})(CommentStatus = exports.CommentStatus || (exports.CommentStatus = {}));
const Comment = new mongoose_1.Schema({
    text: { type: mongoose_1.Schema.Types.String, required: true },
    edited: { type: mongoose_1.Schema.Types.Boolean, default: false },
    status: { type: mongoose_1.Schema.Types.String, default: CommentStatus.ACTIVE },
    user: { type: mongoose_1.Schema.Types.ObjectId, ref: 'users', required: true },
}, { timestamps: true });
exports.default = (0, mongoose_1.model)('comments', Comment);
