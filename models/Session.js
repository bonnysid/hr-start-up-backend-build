"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const Session = new mongoose_1.Schema({
    ip: { type: mongoose_1.Schema.Types.String },
    country: { type: mongoose_1.Schema.Types.String },
    city: { type: mongoose_1.Schema.Types.String },
});
exports.default = (0, mongoose_1.model)('sessions', Session);
