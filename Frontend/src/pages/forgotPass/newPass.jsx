import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from 'react-router-dom';
import "./newPass.css";

function newPass() {
  const navigate = useNavigate();
  const location = useLocation();

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
  const [isChecked, setIsChecked] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (location.state?.email) {
      setEmail(location.state.email);
      console.log("Received email from otp page:", location.state.email);
    }
  }, []);

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError("Passwords do not match!");
      return;
    }
    if (!isStrongPassword) {
      setError("Password must be at least 8 characters long and include at least one uppercase letter, one lowercase letter, one number, and one special symbol.");
      return;
    }

    setError("");

    try {
      const res = await fetch("http://localhost:5001/api/auth/update", {
        method: "POST",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email, password: password }),
      });

      const data = await res.json();
      if (data.message === "Password updated successfully.") {
        alert("Password successfully updated.");
        navigate("/login", {
          replace: true,
          state: null,
        }); 
      } else {
        alert(data.message);
      }
    } catch (err) {
      console.error("Error resetting password:", err);
      alert("Failed to reset password. Please try again.");
    }
  };

  return (
    <div className="container">
      <div className="pass-box">
        <h2>Change Password</h2>
        <form onSubmit={handleSubmit}>
          <label>New Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <ul className="checklist">
            <li className={validationChecks.length ? "valid" : "invalid"}>At least 8 characters</li>
            <li className={validationChecks.lowercase ? "valid" : "invalid"}>1 lowercase letter</li>
            <li className={validationChecks.uppercase ? "valid" : "invalid"}>1 uppercase letter</li>
            <li className={validationChecks.number ? "valid" : "invalid"}>1 number</li>
            <li className={validationChecks.symbol ? "valid" : "invalid"}>1 symbol (e.g. !@#$%)</li>
          </ul>

          <label>Confirm Password</label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
          
          {error && <p className="errorMessage">{error}</p>}

          <div className="checkbox-container">
            <input
              type="checkbox"
              checked={isChecked}
              onChange={(e) => setIsChecked(e.target.checked)}
              required
            />
            <label>
              I hereby accept the 
              <a href="#">Terms & Conditions</a>
            </label>
          </div>
          <button type="submit" className="reset-btn" disabled={!isChecked}>
            Reset Password
          </button>
        </form>
      </div>
    </div>
  );
}

export default newPass;
 