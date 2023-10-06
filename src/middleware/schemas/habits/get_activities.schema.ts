import { InferType, date, object, string } from "yup";

const GetActivitiesSchema = object({
	params: object({
		habitId: string().required("'habitId' wymagane")
	}),
	query: object({
		dateFrom: date().required("'dateFrom' wymagane")
	})
});

type GetActivitiesData = InferType<typeof GetActivitiesSchema>;

export { GetActivitiesData, GetActivitiesSchema };
