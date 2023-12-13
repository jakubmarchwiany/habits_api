import { InferType, object, string } from "yup";

const loginSchema = object({
	body: object({
		password: string().required("'password' wymagane"),
		username: string().required("'username' wymagane")
	})
});

type LoginData = InferType<typeof loginSchema>;

export { LoginData, loginSchema };
