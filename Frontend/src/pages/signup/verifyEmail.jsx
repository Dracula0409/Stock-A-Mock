import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useLocation } from "react-router-dom";
import "./verifyEmail.css";

function VerifyEmail() {
  const navigate = useNavigate();

  const location = useLocation();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [generatedOtp, setGeneratedOtp] = useState("");
  const [isRequestInProgress, setIsRequestInProgress] = useState(false);

  useEffect(() => {
    if (location.state?.email && location.state?.password) {
      setName(location.state.name);
      setEmail(location.state.email);
      setPassword(location.state.password);

      // Call generateOtp only once
      if (!generatedOtp) {
        console.log("Generating OTP...");
        generateOtp(location.state.email);
      }else {
        console.log("Otp Already sent or user is verified.");
      }
    }else{
      console.log("No email or password found in location");
    }
  }, []); // Empty dependency array ensures this runs only once

  const [otp, setOtp] = useState(["", "", "", ""]);
  const [timerCount, setTimer] = useState(60);
  const [disable, setDisable] = useState(true);

  useEffect(() => {
    if (timerCount > 0) {
      const interval = setInterval(() => {
        setTimer((prevTimer) => prevTimer - 1);
      }, 1000);
      return () => clearInterval(interval); // Cleanup interval on unmount
    } else {
      setDisable(false);
    }
  }, [timerCount]);

  const handleResendOTP = () => {
    setTimer(60);
    setDisable(true);
    generateOtp(email);
    console.log("OTP Resent!");
  };

  const handleChange = (e, index) => {
    let newOtp = [...otp];
    newOtp[index] = e.target.value.replace(/\D/, "");
    setOtp(newOtp);

    if (e.target.value.replace(/\D/, "") && index < 3) {
      document.getElementById(`otp-${index + 1}`).focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      document.getElementById(`otp-${index - 1}`).focus();
    }
    if (e.key === "ArrowLeft" && index > 0) {
      document.getElementById(`otp-${index - 1}`).focus();
      e.preventDefault();
    }
    if (e.key === "ArrowRight" && index < 3) {
      document.getElementById(`otp-${index + 1}`).focus();
      e.preventDefault();
    }
  };

  let debounceTimeout;

  const generateOtp = async (email) => {
    if (debounceTimeout || isRequestInProgress) return;

    setIsRequestInProgress(true);
    debounceTimeout = setTimeout(() => {
      debounceTimeout = null;
    }, 1000);

    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    setGeneratedOtp(otp);
    console.log("Generating OTP for email:", email);

    try {
      console.log("verify email request");      
      const res = await fetch("http://localhost:5001/api/mail/signupEmail", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ recepient_email: email, OTP: otp }),
      });

      const data = await res.text();
    } catch (err) {
      console.log("Failed to send OTP.", err);
    } finally {
      setIsRequestInProgress(false);
    }
  };

  const handleVerify = async () => {
    const enteredOtp = otp.join("");

    if (enteredOtp == generatedOtp) {
      const result = await fetch("http://localhost:5001/api/user/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: name, email: email, password: password }),
      });

      const data = await result.json();

      if (data.msg === "User registered") {
        //  alert(`OTP Verified \nEntered OTP : ${otp.join("")}`);

        alert(`OTP Verified\nAccount Created`);
        setTimeout(() => {
          navigate("/login",{
            replace: true,
            state : null});
        }, 1000);
      } else {
        alert("Internal server Error");
      }
    } else {
      alert(`Wrong OTP. Try again`);
    }
  };

  return (
    <div className="container">
      <div className="verify-box">
        <h2>E-mail Verification</h2>
        <p>We have sent a code to your email </p>
        <form autoComplete="off">
          <div className="otp-input">
            <input
              type="text"
              name="fake"
              style={{ display: "none" }}
              autoComplete="off"
            ></input>
            {otp.map((digit, index) => (
              <input
                key={index}
                id={`otp-${index}`}
                type="text"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(e, index)}
                onKeyDown={(e) => handleKeyDown(e, index)}
                name={`otp-${index}-${Math.random()}`}
                autoComplete="one-time-code"
                inputMode="numeric"
              />
            ))}
          </div>
        </form>
        <button className="verify-btn" onClick={handleVerify}>
          Verify Account
        </button>
        <p>
          {disable ? (
            <span>
              Resend OTP in <strong>{timerCount}s </strong>
            </span>
          ) : (
            <span>Didn't receive code? </span>
          )}
          <a
            className={`resend-link ${disable ? "disabled" : ""}`}
            href="#"
            onClick={(e) => {
              if (disable) {
                e.preventDefault();
                return;
              }
              handleResendOTP();
            }}
          >
            Resend OTP
          </a>
        </p>
      </div>
    </div>
  );
}
export default VerifyEmail;
