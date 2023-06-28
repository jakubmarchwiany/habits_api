import { InferType, number, object, string } from "yup";

const createHabitSchema = object({
    body: object({
        name: string().required("'name' wymagane").min(1, "Minmalna długość to 1 znak"),
        n_steps: number().required("'n_steps' wymagane").min(1, "Minimalna liczba to 1"),
    }),
});
export type CreateHabitData = InferType<typeof createHabitSchema>;
export default createHabitSchema;
