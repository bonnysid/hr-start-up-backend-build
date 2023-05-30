"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserStatus = void 0;
const mongoose_1 = require("mongoose");
var UserStatus;
(function (UserStatus) {
    UserStatus["ACTIVE"] = "ACTIVE";
    UserStatus["BANNED"] = "BANNED";
})(UserStatus = exports.UserStatus || (exports.UserStatus = {}));
const User = new mongoose_1.Schema({
    password: {
        type: String,
        required: true,
    },
    firstName: {
        type: String,
    },
    lastName: {
        type: String,
    },
    email: {
        type: String,
        unique: true,
        required: true,
        index: true,
    },
    phone: {
        type: String,
    },
    isConfirmedEmail: {
        type: Boolean,
        default: false,
    },
    status: { type: String, default: UserStatus.ACTIVE },
    roles: [{ type: mongoose_1.Schema.Types.ObjectId, ref: 'roles' }],
    avatar: {
        type: String,
        required: false,
        default: null,
    },
    banReason: { type: mongoose_1.Schema.Types.ObjectId, ref: 'banReasons' },
    sessions: [{ type: mongoose_1.Schema.Types.ObjectId, ref: 'sessions' }],
    tempEmailCode: { type: mongoose_1.Schema.Types.String },
    tempEmail: { type: mongoose_1.Schema.Types.String },
}, { timestamps: true });
exports.default = (0, mongoose_1.model)('users', User);
