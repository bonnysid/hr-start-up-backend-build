"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const Tag = new mongoose_1.Schema({
    value: {
        type: String,
        unique: true,
        required: true,
    },
});
exports.default = (0, mongoose_1.model)('tags', Tag);
