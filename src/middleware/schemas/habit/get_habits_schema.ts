import { InferType, date, object, string } from "yup";

const getHabitsSchema = object({
    query: object({
        isUser: string().required("'isUser' wymagane"),
        dateFrom: date().required("'dateFrom' wymagane")
    })
});
export type GetHabitsData = InferType<typeof getHabitsSchema>;
export default getHabitsSchema;
