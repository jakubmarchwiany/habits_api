import { InferType, date, object, string } from "yup";

const getHabitActivitiesSchema = object({
    query: object({
        dateFrom: date().required("'dateFrom' wymagane"),
    }),
    params: object({
        _id: string().required("'_id' wymagane"),
    })
});
export type GetHabitActivitiesData = InferType<typeof getHabitActivitiesSchema>;
export default getHabitActivitiesSchema;
