import { InferType, object, string } from "yup";

const addActivitySchema = object({
    body: object({
        habitID: string().required("'habitID' wymagane"),
        date: string().required("'date' wymagane"),
    }),
});
export type AddActivityData = InferType<typeof addActivitySchema>;
export default addActivitySchema;
