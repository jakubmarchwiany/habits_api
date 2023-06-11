"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const yup_1 = require("yup");
const editHabitsOrderSchema = (0, yup_1.object)({
    body: (0, yup_1.object)({
        habitsID: (0, yup_1.array)(),
    }),
});
exports.default = editHabitsOrderSchema;
