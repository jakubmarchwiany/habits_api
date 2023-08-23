import { InferType, object, string } from "yup";

const deleteActivitySchema = object({
    body: object({
        _id: string().required("'_id' wymagane"),
    }),
});
export type DeleteActivityData = InferType<typeof deleteActivitySchema>;
export default deleteActivitySchema;
