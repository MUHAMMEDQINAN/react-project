import {Link} from "react-router";
import Button from "../../components/button/Button";
import TextField from "../../components/text-field/TextField";
import "./login.scss";

const Login = () => {


  return (
    <div className="container">
      <div className="container-children">
        <div className="text">
          <span>Login</span>
          <span>to get started</span>
        </div>

        <form>
          <TextField
            type="email"
            name="Email Address"
            hintText="Email Address"
          />
          <TextField type={"email"} name={"pwd"} hintText={"Password"} />
        </form>

        <span className="forgot-pwd-text">Forgot Password?</span>

        <Link to='/'  className="link-to"><Button name="Continue" onClick={() => null}  /></Link>

        <div className="register-user">
          <span>New User?</span>
          <span>Register</span>
        </div>
      </div>
    </div>
  );
};

export default Login;
