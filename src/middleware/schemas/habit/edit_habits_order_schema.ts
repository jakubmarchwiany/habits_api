import { InferType, array, object } from "yup";

const editHabitsOrderSchema = object({
    body: object({
        habitGroups: array(),
    }),
});
export type EditOrderHabitsData = InferType<typeof editHabitsOrderSchema>;
export default editHabitsOrderSchema;
