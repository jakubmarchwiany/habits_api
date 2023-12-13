import { InferType, date, object, string } from "yup";

const getHabitsSchema = object({
	query: object({
		dateFrom: date()
			.required("Query 'dateFrom' wymagane")
			.max(new Date(), "'dateFrom' musi być przeszłością"),
		myHabits: string().required("Query 'myHabits' wymagane")
	})
});

type GetHabitsData = InferType<typeof getHabitsSchema>;

export { GetHabitsData, getHabitsSchema };
