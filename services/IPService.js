"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.IPService = exports.IpType = void 0;
const geoip_lite_1 = __importDefault(require("geoip-lite"));
var IpType;
(function (IpType) {
    IpType["LOCAL"] = "LOCAL";
    IpType["REMOTE"] = "REMOTE";
})(IpType = exports.IpType || (exports.IpType = {}));
class IPService {
    static getIp(req) {
        const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
        if (ip) {
            if (Array.isArray(ip)) {
                return {
                    ip: ip[0],
                };
            }
            else {
                return {
                    ip,
                };
            }
        }
        return {
            error: 'Не удалось определить IP',
            ip: '',
        };
    }
    static isPrivateIp(ip) {
        return (ip === '127.0.0.1' || // IPv4-петля
            ip === '::1' || // IPv6-петля
            /^10\./.test(ip) || // приватная сеть класса A
            /^172\.(1[6-9]|2\d|3[01])\./.test(ip) || // приватная сеть класса B
            /^192\.168\./.test(ip) // приватная сеть класса C
        );
    }
    static getIpInfo(ip) {
        if (IPService.isPrivateIp(ip)) {
            return {
                type: IpType.LOCAL,
                ip,
            };
        }
        else {
            return {
                ip,
                type: IpType.REMOTE,
                geo: geoip_lite_1.default.lookup(ip),
            };
        }
    }
}
exports.IPService = IPService;
