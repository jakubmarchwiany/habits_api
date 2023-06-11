"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const catchError = (func) => {
    return (req, res, next) => {
        func(req, res, next).catch((error) => {
            next(error);
        });
    };
};
exports.default = catchError;
