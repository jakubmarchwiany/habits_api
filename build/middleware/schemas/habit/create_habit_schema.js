"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const yup_1 = require("yup");
const createHabitSchema = (0, yup_1.object)({
    body: (0, yup_1.object)({
        name: (0, yup_1.string)().required("'name' wymagane").min(1, "Minmalna długość to 1 znak"),
    }),
});
exports.default = createHabitSchema;
