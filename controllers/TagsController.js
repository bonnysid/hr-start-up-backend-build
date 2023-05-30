"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Tag_1 = __importDefault(require("../models/Tag"));
const Post_1 = __importDefault(require("../models/Post"));
const TagDTO_1 = __importDefault(require("../dtos/TagDTO"));
class TagsController {
    getTags(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const tags = yield Tag_1.default.find();
                const canDeleteEdits = [];
                for (let i = 0; i < tags.length; i++) {
                    const post = yield Post_1.default.findOne({ tags: { $in: tags[i].id } });
                    canDeleteEdits.push(!post);
                }
                const tagsDTOS = tags.map((it, i) => new TagDTO_1.default(Object.assign(Object.assign({}, it.toObject()), { canDeleteEdit: canDeleteEdits[i] })));
                return res.json(tagsDTOS);
            }
            catch (e) {
                console.log(e);
                return res.status(403).json({ message: 'Нету доступа' });
            }
        });
    }
}
exports.default = new TagsController();
