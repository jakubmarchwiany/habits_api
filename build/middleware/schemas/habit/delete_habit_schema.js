"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const yup_1 = require("yup");
const deleteHabitSchema = (0, yup_1.object)({
    body: (0, yup_1.object)({
        id: (0, yup_1.string)().required("'id' wymagane"),
    }),
});
exports.default = deleteHabitSchema;
