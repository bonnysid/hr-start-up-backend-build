"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.required = void 0;
const express_validator_1 = require("express-validator");
const required = (field, message) => {
    return (0, express_validator_1.body)(field, message || 'Обязательное поле').trim().notEmpty();
};
exports.required = required;
