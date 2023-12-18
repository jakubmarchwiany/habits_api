import { InferType, number, object, string } from "yup";

const updateHabitSchema = object({
	body: object({
		newDescription: string().min(0),
		newEmoji: string().required("Body 'emoji' wymagane"),
		newName: string().required("Body 'newName' wymagane").min(1, "Minimalna długość to 1 znak"),
		newPeriodInDays: number()
			.required("Body 'newPeriodInDays' wymagane")
			.min(1, "Minimalna wartość to 1")
			.max(31, "Maksymalna wartość to 31")
	}),
	params: object({
		habitId: string().required("'_id' wymagane")
	})
});

type UpdateHabitData = InferType<typeof updateHabitSchema>;

export { UpdateHabitData, updateHabitSchema };
