import { InferType, object, string } from "yup";

const loginUserSchema = object({
    body: object({
        username: string().required("'username' wymagane"),
        password: string()
            .required("'password' wymagane")
            .min(8, "Podano nieprawidłowe dane uwierzytelniające")
            .max(20, "Podano nieprawidłowe dane uwierzytelniające"),
    }),
});
export type LoginUserData = InferType<typeof loginUserSchema>;
export default loginUserSchema;
