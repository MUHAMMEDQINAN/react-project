import "./login.scss";

const Login = () => {
  return (
    <div className="container">
      <div className="container-children">
        <div className="text">
          <span>Login</span>
          <span>to get started</span>
        </div>
        <form className="form-list">
          <input
            type="email"
            name="Email Address"
            placeholder="Enter Email"
          ></input>
          <input
            type="password"
            name="Password"
            placeholder="Enter Password"
          ></input>
        </form>

        <span className="forgot-pwd-text">Forgot Password?</span>
      </div>
    </div>
  );
};

export default Login;
