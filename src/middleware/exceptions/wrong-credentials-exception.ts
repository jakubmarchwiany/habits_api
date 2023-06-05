import HttpException from "./http";

class WrongCredentialsException extends HttpException {
    constructor() {
        super(401, "Podano nieprawidłowe dane uwierzytelniające");
    }
}
export default WrongCredentialsException;
