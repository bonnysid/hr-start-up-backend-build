"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const DefaultDTO_1 = __importDefault(require("./DefaultDTO"));
class RoleDTO extends DefaultDTO_1.default {
    constructor(model) {
        super(model);
        this.value = model.value;
        this.canDeleteEdit = model.canDeleteEdit;
    }
}
exports.default = RoleDTO;
