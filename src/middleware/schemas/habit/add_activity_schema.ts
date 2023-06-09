import { InferType, object, string } from "yup";

const addActivitySchema = object({
    body: object({
        id: string().required("'id' wymagane"),
        date: string().required("'date' wymagane"),
    }),
});
export type AddActivityData = InferType<typeof addActivitySchema>;
export default addActivitySchema;
