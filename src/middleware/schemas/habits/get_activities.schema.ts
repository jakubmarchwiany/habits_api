import { InferType, date, object, string } from "yup";

const GetActivitiesSchema = object({
	params: object({
		habitId: string().required("'habitId' wymagane")
	}),
	query: object({
		dateFrom: date()
			.required("'dateFrom' wymagane")
			.max(new Date(), "'dateFrom' musi być przeszłością")
	})
});

type GetActivitiesData = InferType<typeof GetActivitiesSchema>;

export { GetActivitiesData, GetActivitiesSchema };
