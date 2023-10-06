import { InferType, object, string } from "yup";

const deleteHabitSchema = object({
	params: object({
		habitId: string().required("Param 'habitId' wymagane")
	})
});

type DeleteHabitData = InferType<typeof deleteHabitSchema>;

export { DeleteHabitData, deleteHabitSchema };
