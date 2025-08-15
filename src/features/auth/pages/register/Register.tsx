import { Link } from "react-router";
import Button from "../../components/button/Button";
import TextField from "../../components/text-field/TextField";
import "./register.scss";

const Register = () => {
  return (
    <div className="container">
      <div className="container-children">
        <div className="text">
          <span>Register</span>
          <span>habeebi...</span>
        </div>

        <form>
          <TextField type="name" name="name" hintText="Name" />
          <TextField type="phone" name="phone" hintText="Phone" />
          <TextField type="email" name="email" hintText="Email" />
          <TextField type="password" name="password" hintText="Password" />
          <TextField
            type="password"
            name="confirmPassword"
            hintText="Confirm Password"
          />
        </form>

        <span className="forgot-pwd-text">Forgot Password?</span>

        <Link to="/" className="link-to">
          <Button name="Continue" onClick={() => null} />
        </Link>

        <div className="register-user">
          <span>New User?</span>
          <span>Register</span>
        </div>
      </div>
    </div>
  );
};

export default Register;
