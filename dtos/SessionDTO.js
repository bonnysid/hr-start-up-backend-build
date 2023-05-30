"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const DefaultDTO_1 = __importDefault(require("./DefaultDTO"));
class SessionDTO extends DefaultDTO_1.default {
    constructor(model, isCurrent) {
        super(model);
        this.country = model.country;
        this.city = model.city;
        this.ip = model.ip;
        this.isCurrent = isCurrent;
    }
}
exports.default = SessionDTO;
