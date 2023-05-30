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
const nodemailer_1 = __importDefault(require("nodemailer"));
class EmailService {
    constructor() {
        this.transporter = nodemailer_1.default.createTransport({
            host: String(process.env.EMAIL_HOST),
            port: Number(process.env.EMAIL_PORT),
            secure: true,
            auth: {
                user: String(process.env.EMAIL_LOGIN),
                pass: String(process.env.EMAIL_PASSWORD)
            },
            tls: {
                rejectUnauthorized: false
            }
        });
    }
    sendMail(to, html, subject = 'Подтверждение почты') {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.transporter.sendMail({
                from: 'inveapp@yandex.ru',
                to,
                subject,
                html,
            });
        });
    }
}
exports.default = new EmailService();
