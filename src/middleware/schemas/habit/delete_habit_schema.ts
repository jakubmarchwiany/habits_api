import { InferType, object, string } from "yup";

const deleteHabitSchema = object({
    body: object({
        id: string().required("'id' wymagane"),
    }),
});
export type DeleteHabitData = InferType<typeof deleteHabitSchema>;
export default deleteHabitSchema;
