import { InferType, object, string } from "yup";

const deleteHabitSchema = object({
    body: object({
        _id: string().required("'_id' wymagane"),
    }),
});
export type DeleteHabitData = InferType<typeof deleteHabitSchema>;
export default deleteHabitSchema;
