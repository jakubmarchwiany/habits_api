import { InferType, object, string } from "yup";

const createActivitySchema = object({
	body: object({
		date: string().required("'date' wymagane"),
		habitId: string().required("'habitId' wymagane")
	})
});

type CreateActivityData = InferType<typeof createActivitySchema>;

export { CreateActivityData, createActivitySchema };
