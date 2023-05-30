"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class DefaultDTO {
    constructor(model) {
        this.id = model._id || model.id;
    }
}
exports.default = DefaultDTO;
