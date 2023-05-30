"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const TagsController_1 = __importDefault(require("../controllers/TagsController"));
const AuthMiddleware_1 = require("../middleware/AuthMiddleware");
const router = (0, express_1.Router)();
router.get('/', AuthMiddleware_1.authMiddleware, TagsController_1.default.getTags);
exports.default = router;
