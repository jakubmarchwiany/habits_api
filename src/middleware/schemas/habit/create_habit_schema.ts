import { InferType, number, object, string } from "yup";

const createHabitSchema = object({
    body: object({
        name: string().required("'name' wymagane").min(1, "Minmalna długość to 1 znak"),
        description: string(),
        periodInDays: number().required("'periodInDays' wymagane").min(1, "Minmalna wartość to 1"),
    }),
});
export type CreateHabitData = InferType<typeof createHabitSchema>;
export default createHabitSchema;
