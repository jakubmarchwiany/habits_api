import { InferType, date, object, string } from "yup";

const getHabitsSchema = object({
	query: object({
		myHabits: string().required("Query 'myHabits' wymagane"),
		dateFrom: date()
			.required("Query 'dateFrom' wymagane")
			.max(new Date(), "'dateFrom' musi być przeszłością")
	})
});

type GetHabitsData = InferType<typeof getHabitsSchema>;

export { GetHabitsData, getHabitsSchema };
