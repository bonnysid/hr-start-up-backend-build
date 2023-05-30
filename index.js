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
exports.server = void 0;
const express_1 = __importDefault(require("express"));
const mongoose_1 = __importDefault(require("mongoose"));
const AuthRouter_1 = __importDefault(require("./routers/AuthRouter"));
const AdminRouter_1 = __importDefault(require("./routers/AdminRouter"));
const UserRouter_1 = __importDefault(require("./routers/UserRouter"));
const TagsRouter_1 = __importDefault(require("./routers/TagsRouter"));
const PostsRouter_1 = __importDefault(require("./routers/PostsRouter"));
const DialogRouter_1 = __importDefault(require("./routers/DialogRouter"));
const ComplaintRouter_1 = __importDefault(require("./routers/ComplaintRouter"));
const config_1 = require("./config");
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const cors_1 = __importDefault(require("cors"));
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
const swagger_json_1 = __importDefault(require("./swagger.json"));
const http_1 = require("http");
require("./controllers/SocketController");
const PORT = process.env.PORT || 5000;
const app = (0, express_1.default)();
exports.server = (0, http_1.createServer)(app);
app.use((0, cors_1.default)({
    credentials: true,
    origin: (requestOrigin, callback) => {
        if ([process.env.CLIENT_URL, process.env.BUILD_CLIENT_URL].includes(requestOrigin)) {
            callback(null, true);
        }
        else {
            callback(null, true);
        }
    }
}));
app.use(express_1.default.json());
app.use((0, cookie_parser_1.default)());
app.use('/auth', AuthRouter_1.default);
app.use('/admin', AdminRouter_1.default);
app.use('/users', UserRouter_1.default);
app.use('/tags', TagsRouter_1.default);
app.use('/posts', PostsRouter_1.default);
app.use('/dialogs', DialogRouter_1.default);
app.use('/complaints', ComplaintRouter_1.default);
app.use('/docs', swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(swagger_json_1.default));
app.use('/avatars', express_1.default.static('avatars'));
app.use('/videos', express_1.default.static('videos'));
const start = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield mongoose_1.default.connect(config_1.config.dbUrl);
        exports.server.listen(PORT, () => {
            console.log(`server started on port ${PORT}`);
        });
    }
    catch (e) {
        console.log(e);
    }
});
start();
