"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const SocketController_1 = require("../controllers/SocketController");
class WSError extends Error {
    constructor(status, message) {
        super();
        this.status = status;
        this.message = message;
        this.event = SocketController_1.MessageEvents.ERROR;
    }
    static badRequest(message) {
        return new WSError(400, message);
    }
    static unauthorized() {
        return new WSError(401, 'Не авторизован');
    }
}
exports.default = WSError;
