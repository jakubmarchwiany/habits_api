import { InferType, number, object, date, string } from "yup";

const addActivitySchema = object({
    body: object({
        habitName: string().required("'habitName' wymagane"),
        date: date().required("'date' wymagane"),
    }),
});
export type AddActivityData = InferType<typeof addActivitySchema>;
export default addActivitySchema;
