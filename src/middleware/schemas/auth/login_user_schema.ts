import { InferType, object, string } from "yup";

const loginUserSchema = object({
    body: object({
        username: string().required("'username' wymagane"),
        password: string().required("'password' wymagane"),
    }),
});
export type LoginUserData = InferType<typeof loginUserSchema>;
export default loginUserSchema;
