import { InferType, array, object, string } from "yup";

const GroupsOfHabitsSchema = object().shape({
	_id: string().required(),
	habitsIds: array().of(string().required()).required(),
	name: string().required()
});

const updateGroupsOfHabitsSchema = object({
	body: object({
		newGroupsOfHabits: array().of(GroupsOfHabitsSchema).required()
	})
});

type UpdateGroupsOfHabitsData = InferType<typeof updateGroupsOfHabitsSchema>;

export { UpdateGroupsOfHabitsData, updateGroupsOfHabitsSchema };
