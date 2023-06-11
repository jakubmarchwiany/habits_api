import { InferType, object, string } from "yup";

const editHabitNameSchema = object({
    body: object({
        id: string().required("'id' wymagane"),
        newName: string().required("'newName' wymagane").min(1, "Minmalna długość to 1 znak"),
    }),
});
export type EditHabitNameData = InferType<typeof editHabitNameSchema>;
export default editHabitNameSchema;
