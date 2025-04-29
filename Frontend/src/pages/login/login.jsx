import './login.css';
import { useNavigate } from 'react-router-dom';
import {useState, useEffect} from 'react';

function Login(){
  const navigate = useNavigate();

  const [captcha, setCaptcha]=useState("");
  const [gcaptcha, setgCaptcha]=useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");


  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      fetch('http://localhost:5001/api/demat/me', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
        .then(res => {
          if (res.ok) {
            navigate('/dashboard', { replace: true });
          }
        })
        .catch(err => console.error("Token check failed", err));
    }

    generateCaptcha();
  }, []);

  async function handleLogIn() {
    if (captcha !== gcaptcha) {
      alert("Wrong Captcha");
      generateCaptcha();
      return;
    }
  
    try {
      const res = await fetch("http://localhost:5001/api/user/login", {
        method: "POST",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email, password: password }),
      });
  
      const data = await res.json();
  
      if (!res.ok) {
        // Handle different status codes with specific messages
        if (res.status === 404) {
          alert("User not found");
        } else if (res.status === 401) {
          alert("Incorrect password");
        } else {
          alert("Server error: " + (data.message || "Unknown error"));
        }
        return;
      }
  
      // Successful login
      if (data.message === "success") {
        localStorage.setItem("token", data.token); // Optional
        alert("Account logged in!");
        setTimeout(() => {
          navigate('/dashboard', {
            replace: true
          });
        }, 1500);
      } else {
        alert("Unexpected response from server");
      }
  
    } catch (error) {
      console.error("Login failed:", error);
      alert("Network error or server unreachable. Please try again later.");
    }
  }

  function generateCaptcha(length = 6) {
    const chars = "ABCDEFGHJKLMNOPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz0123456789";
    let capt=""
    for (let i = 0; i < length; i++) {
        capt += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setgCaptcha(capt)
    return capt;
  }

  function handleEmailChange(event){
    setEmail(event.target.value);
  }

  function handlePasswordChange(event){
    setPassword(event.target.value);
  }

  function handleCaptchaChange(event){
    setCaptcha(event.target.value);
  }

  function handleForgot() {
    const email = prompt("Please enter your email address:");
    if (email) {
      checkEmailExists(email);
    }
  }
  
  async function checkEmailExists(email) {
    try {
      const res = await fetch('http://localhost:5001/api/user/check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
  
      const data = await res.json();
      if (data.exists) {
        // Email exists, proceed to forgot password OTP page
        navigate('/forgotPass', { state: { email } });
      } else {
        // Email does not exist, prompt user to sign up
        if (confirm("Email not found. Would you like to sign up?")) {
          navigate('/signup', {replace: true});
        }
      }
    } catch (err) {
      console.error("Failed to check email:", err);
    }
  }

  function handleSignUp(){
    console.log("working...");
    navigate('/signup', {replace: true});
  }

  return(
    <div className="page">
       
      <div className="login-box">

        <div className="heading">Log In</div>

        <div className="credentials-input-box">

          <div className="username-input-box">
            <label  className="username-label" htmlFor="username">E-mail</label>
            <input className="username" id="username" type="text" placeholder="username" onChange={handleEmailChange}></input>
          </div>

          <div className="password-input-box">
            <label className="password-label" htmlFor="password">Password</label>
            <input className="pin" id="password" type="password" placeholder="password" onChange={handlePasswordChange}></input>
          </div>

          <div className="captcha-input-box">
            <label className="captcha-label" htmlFor="captcha-input">Captcha</label>

             <div className="captcha">
                <div className="captcha-display">{gcaptcha}</div>
                <input className="captcha-input" id="captcha-input" type="text" placeholder="captcha" onChange={handleCaptchaChange}></input>
              </div>
                
          </div>

        </div>

        <div className="forgot-password"><a onClick={handleForgot}>Forgot Password?</a></div>

        <div className="log-in">
          <button onClick={handleLogIn}  className="login-button" >log in</button>
          <p>Don&apos;t have an account? <span className="signup" ><a onClick={handleSignUp}>Sign Up</a></span></p>
        </div>

       </div>

    </div>
  );
}
export default Login;
