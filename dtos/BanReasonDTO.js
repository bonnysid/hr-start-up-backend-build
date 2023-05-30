"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const UserDTO_1 = __importDefault(require("../dtos/UserDTO"));
const DefaultDTO_1 = __importDefault(require("../dtos/DefaultDTO"));
class BanReasonDTO extends DefaultDTO_1.default {
    constructor(model, isAdmin) {
        super(model);
        this.text = model.text;
        this.user = isAdmin ? new UserDTO_1.default(model.user) : undefined;
    }
}
exports.default = BanReasonDTO;
