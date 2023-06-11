"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const yup_1 = require("yup");
const loginUserSchema = (0, yup_1.object)({
    body: (0, yup_1.object)({
        username: (0, yup_1.string)().required("'username' wymagane"),
        password: (0, yup_1.string)().required("'password' wymagane"),
    }),
});
exports.default = loginUserSchema;
