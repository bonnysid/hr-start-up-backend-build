"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const Message = new mongoose_1.Schema({
    text: { type: mongoose_1.Schema.Types.String, required: true },
    event: { type: mongoose_1.Schema.Types.String, required: true },
    photoUrl: { type: mongoose_1.Schema.Types.String },
    read: { type: mongoose_1.Schema.Types.Boolean, default: false },
    user: { type: mongoose_1.Schema.Types.ObjectId, ref: 'users' },
}, { timestamps: true });
exports.default = (0, mongoose_1.model)('messages', Message);
