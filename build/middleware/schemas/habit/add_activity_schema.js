"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const yup_1 = require("yup");
const addActivitySchema = (0, yup_1.object)({
    body: (0, yup_1.object)({
        id: (0, yup_1.string)().required("'id' wymagane"),
        date: (0, yup_1.string)().required("'date' wymagane"),
    }),
});
exports.default = addActivitySchema;
