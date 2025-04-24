import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./signup.css";

function Signup() {
  const navigate = useNavigate();

  function goToLogin() {
    navigate("/login");
  }

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [validationChecks, setValidationChecks] = useState({
      length: false,
      lowercase: false,
      uppercase: false,
      number: false,
      symbol: false,
  });
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [isSignupDisabled, setSignupDisabled] = useState(true);

  useEffect(() => {
    setValidationChecks({
      length: password.length >= 8,
      lowercase: /[a-z]/.test(password),
      uppercase: /[A-Z]/.test(password),
      number: /\d/.test(password),
      symbol: /[\W_]/.test(password),
    });
  }, [password]);

  const isStrongPassword = Object.values(validationChecks).every(Boolean);

  // This goes inside your component, above the return statement
  const getValidationClass = (condition) => {
    return condition ? "valid" : "invalid";
  };

  function changePasswordColorGreen() {
    document
      .querySelector(".password")
      .setAttribute("style", "color:green;outline:2px solid rgb(16, 201, 16)");

    document
      .querySelector(".confirm-password")
      .setAttribute("style", "color:green;outline:2px solid rgb(16, 201, 16)");
  }

  function changePasswordColorRed() {
    document
      .querySelector(".password")
      .setAttribute(
        "style",
        "color: rgb(245, 30, 30);outline:2px solid rgb(245, 30, 30)"
      );

    document
      .querySelector(".confirm-password")
      .setAttribute(
        "style",
        "color: rgb(245, 30, 30);outline:2px solid rgb(245, 30, 30)"
      );
  }

  function handleNameChange(event) {
    setName(event.target.value);
  }

  function handleEmailChange(event) {
    setEmail(event.target.value);
  }

  function handlePasswordChange(event) {
    setPassword(event.target.value);
  }

  function handleconfirmPasswordChange(event) {
    setConfirmPassword(event.target.value);
  }

  useEffect(() => {
    let newErrors = {}

    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "Invalid email or username!";
    }

    if (password && password.length < 8) {
      newErrors.password = "must be atleast 8 characters!";
    }

    if (confirmPassword && confirmPassword !== password) {
      newErrors.confirmPassword = "Password does not match!";
      changePasswordColorRed();
    }

    if (password && confirmPassword && password === confirmPassword) {
      changePasswordColorGreen();
    }

    if (!(email && password && confirmPassword)) {
      newErrors.details = "enter required details";
    }

    setErrors(newErrors);
    setSignupDisabled(Object.keys(newErrors).length > 0);
  }, [email, password, confirmPassword]);

  const handleSignUp = async () => {
    const newErrors = {}; // <-- make it local

    if (!isStrongPassword) {
      newErrors.strongPassword = [
        "Password must be at least 8 characters long.",
        "Include at least:",
        "• 1 uppercase letter",
        "• 1 lowercase letter",
        "• 1 number",
        "• 1 special symbol"
      ];
      setErrors(newErrors);
      return;
    }
    
    console.log("checking email exist or not");
    const res = await fetch(
      "http://localhost:5001/api/user/check",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email }),
      }
    );

    const data = await res.json();
    if (!data.exists) {
      alert("verify your email");
      navigate("/verifyEmail", { state: {name, email, password } });
    } else {
      alert("Account Already Exists!");
    }

    return;
  };

  return (
    <div className="page-body">
      <div className="signup-box">
        <div className="new-account">Create New Account</div>

        <div className="user-input-box">
        <div className="name-box">
            <label htmlFor="name">Username</label>
            <input
              value={name}
              className="name"
              id="name"
              type="name"
              placeholder="john doe"
              onChange={handleNameChange}
            ></input>
          </div>

          <div className="email-box">
            <label htmlFor="email">Email</label>
            <input
              value={email}
              className="email"
              id="email"
              type="email"
              placeholder="abc@gmail.com"
              onChange={handleEmailChange}
            ></input>
            {errors.email && <p className="email-error">{errors.email}</p>}
          </div>

          <div className="password-box">
            <label htmlFor="password">Password</label>
            <input
              value={password}
              className="password"
              id="password"
              type="password"
              placeholder=""
              onChange={handlePasswordChange}
            ></input>
            {errors.password && (
              <p className="password-error">{errors.password}</p>
            )}
          </div>

          <ul className="checklist">
            <li className={validationChecks.length ? "valid" : "invalid"}>At least 8 characters</li>
            <li className={validationChecks.lowercase ? "valid" : "invalid"}>1 lowercase letter</li>
            <li className={validationChecks.uppercase ? "valid" : "invalid"}>1 uppercase letter</li>
            <li className={validationChecks.number ? "valid" : "invalid"}>1 number</li>
            <li className={validationChecks.symbol ? "valid" : "invalid"}>1 symbol (e.g. !@#$%)</li>
          </ul>

          <div className="confirm-pass-box">
            <label htmlFor="conf-pass">Confirm</label>
            <input
              value={confirmPassword}
              className="confirm-password"
              id="conf-pass"
              type="password"
              placeholder=""
              onChange={handleconfirmPasswordChange}
            ></input>
            {errors.confirmPassword && (
              <p className="confirmPassword-error">{errors.confirmPassword}</p>
            )}
          </div>

          {Array.isArray(errors.strongPassword) && (
            <div className="errorMessage">
              {errors.strongPassword.map((line, index) => (
                <p key={index}>{line}</p>
              ))}
            </div>
          )}

          <button
            disabled={isSignupDisabled}
            className="signup-btn"
            onClick={handleSignUp}
          >
            Sign Up
          </button>
          <div className="Terms-box">
            <p className="terms">
              By Signing up, you agree to <b>Terms of Use</b> and{" "}
              <b>Privacy Policy</b>
            </p>
          </div>

          <div className="sign-in-option">
            <p>
              Already have an account?{" "}
              <b style={{ cursor: "pointer" }} onClick={goToLogin}>
                Sign in
              </b>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
export default Signup;
