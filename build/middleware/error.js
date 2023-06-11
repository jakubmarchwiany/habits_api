"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function errorMiddleware(error, request, response, next) {
    const status = error.status || 500;
    const message = error.message || "Coś poszło nie tak";
    response.status(status).send({
        message,
        status,
    });
}
exports.default = errorMiddleware;
