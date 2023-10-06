import { InferType, object, string } from "yup";

const deleteActivitySchema = object({
	params: object({
		activityId: string().required("Param 'activityId' wymagane")
	})
});

type DeleteActivityData = InferType<typeof deleteActivitySchema>;

export { DeleteActivityData, deleteActivitySchema };
