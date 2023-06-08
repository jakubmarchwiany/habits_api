import { InferType, number, object, string } from "yup";

const addHabitSchema = object({
    body: object({
        name: string().required("'name' wymagane").min(1, "Minmalna długość to 1 znak"),
        numberOfActivitiesPerDay: number()
            .required("'numberOfActivitiesPerDay' wymagane")
            .min(1, "Minimalna wartość to 1"),
    }),
});
export type AddHabitData = InferType<typeof addHabitSchema>;
export default addHabitSchema;
