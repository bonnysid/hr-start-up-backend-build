"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const BanReason = new mongoose_1.Schema({
    text: { type: mongoose_1.Schema.Types.String, required: true },
    user: { type: mongoose_1.Schema.Types.ObjectId, ref: 'users', required: true },
}, { timestamps: true });
exports.default = (0, mongoose_1.model)('banReasons', BanReason);
