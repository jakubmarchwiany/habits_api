import { InferType, number, object, string } from "yup";

const createHabitSchema = object({
	body: object({
		description: string(),
		name: string().required("Body 'name' wymagane").min(1, "Minimalna długość to 1 znak"),
		periodInDays: number()
			.required("Body 'periodInDays' wymagane")
			.min(1, "Minimalna wartość to 1")
	})
});

type CreateHabitData = InferType<typeof createHabitSchema>;

export { CreateHabitData, createHabitSchema };
