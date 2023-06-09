import { InferType, object, string } from "yup";

const addHabitSchema = object({
    body: object({
        name: string().required("'name' wymagane").min(1, "Minmalna długość to 1 znak"),
    }),
});
export type AddHabitData = InferType<typeof addHabitSchema>;
export default addHabitSchema;
