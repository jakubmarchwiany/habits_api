import { InferType, date, object, string } from "yup";

const getHabitsSchema = object({
	query: object({
		myHabits: string().required("Query 'myHabits' wymagane"),
		dateFrom: date().required("Query 'dateFrom' wymagane")
	})
});

type GetHabitsData = InferType<typeof getHabitsSchema>;

export { GetHabitsData, getHabitsSchema };
