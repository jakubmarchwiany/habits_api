import { InferType, object, string } from "yup";

const createHabitSchema = object({
    body: object({
        name: string().required("'name' wymagane").min(1, "Minmalna długość to 1 znak")
    }),
});
export type CreateHabitData = InferType<typeof createHabitSchema>;
export default createHabitSchema;
