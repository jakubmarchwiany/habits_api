"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const yup_1 = require("yup");
const editHabitNameSchema = (0, yup_1.object)({
    body: (0, yup_1.object)({
        id: (0, yup_1.string)().required("'id' wymagane"),
        newName: (0, yup_1.string)().required("'newName' wymagane").min(1, "Minmalna długość to 1 znak"),
    }),
});
exports.default = editHabitNameSchema;
