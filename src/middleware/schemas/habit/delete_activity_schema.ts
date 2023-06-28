import { InferType, object, string } from "yup";

const deleteActivitySchema = object({
    body: object({
        id: string().required("'id' wymagane"),
    }),
});
export type DeleteActivityData = InferType<typeof deleteActivitySchema>;
export default deleteActivitySchema;
