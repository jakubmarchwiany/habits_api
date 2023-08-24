import { InferType, number, object, string } from "yup";

const editHabitSchema = object({
    body: object({
        _id: string().required("'id' wymagane"),
        name: string().required("'name' wymagane").min(1, "Minmalna długość to 1 znak"),
        description: string(),
        periodInDays: number()
            .required("'periodInDays' wymagane")
            .min(1, "Minimalna wartość to 1"),
    }),
});
export type EditHabitData = InferType<typeof editHabitSchema>;
export default editHabitSchema;
