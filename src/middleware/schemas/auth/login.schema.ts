import { InferType, object, string } from "yup";

const loginSchema = object({
	body: object({
		username: string().required("'username' wymagane"),
		password: string().required("'password' wymagane")
	})
});

type LoginData = InferType<typeof loginSchema>;

export { LoginData, loginSchema };
