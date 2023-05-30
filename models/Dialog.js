"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const Dialog = new mongoose_1.Schema({
    messages: [{ type: mongoose_1.Schema.Types.ObjectId, ref: 'messages' }],
    users: [{ type: mongoose_1.Schema.Types.ObjectId, ref: 'users' }],
});
exports.default = (0, mongoose_1.model)('dialogs', Dialog);
