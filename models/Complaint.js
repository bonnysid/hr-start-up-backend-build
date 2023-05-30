"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ComplaintType = exports.ComplaintStatus = void 0;
const mongoose_1 = require("mongoose");
var ComplaintStatus;
(function (ComplaintStatus) {
    ComplaintStatus["RESOLVED"] = "RESOLVED";
    ComplaintStatus["UNRESOLVED"] = "UNRESOLVED";
    ComplaintStatus["CLOSED"] = "CLOSED";
})(ComplaintStatus = exports.ComplaintStatus || (exports.ComplaintStatus = {}));
var ComplaintType;
(function (ComplaintType) {
    ComplaintType["POST"] = "POST";
    ComplaintType["USER"] = "USER";
})(ComplaintType = exports.ComplaintType || (exports.ComplaintType = {}));
const Complaint = new mongoose_1.Schema({
    text: { type: mongoose_1.Schema.Types.String, required: true },
    status: { type: mongoose_1.Schema.Types.String, default: ComplaintStatus.UNRESOLVED },
    type: { type: mongoose_1.Schema.Types.String, required: true },
    postId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'posts' },
    userId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'users' },
    author: { type: mongoose_1.Schema.Types.ObjectId, ref: 'users', required: true },
    whoResolve: { type: mongoose_1.Schema.Types.ObjectId, ref: 'users' },
    messages: [{ type: mongoose_1.Schema.Types.ObjectId, ref: 'messages' }]
}, { timestamps: true });
exports.default = (0, mongoose_1.model)('complaints', Complaint);
