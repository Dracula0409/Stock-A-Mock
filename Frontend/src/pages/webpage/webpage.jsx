import {useNavigate} from 'react-router-dom';
import './webpage.css';

function StartPage() {
    const navigate = useNavigate();

    function HandleLogin() {
        navigate('/login');
    }
    function HandleSignUp() {
        navigate('/signup');
    }

    return (
        <div class='webPageBody'>
            <div class='container'>

                <div class='welcome'>
                    <h1 class='title'>Stock-A-Mock</h1>
                    <h3 class='welcome-msg'>What will be it today? A bull run or bear run...</h3>
                    <span class='Enter-App'>
                        <p>Already Been Here? Welcome back!</p>
                        <button class='login-btn' onClick={HandleLogin}>Login</button>
                        <p>But you'll have to prove yourself first...</p>
                    </span>
                    <span class='New-App'>
                        <p>New Here? Say no more!</p>
                        <button class='signup-btn' onClick={HandleSignUp}>Sign up</button>
                        <p>It's Free...</p>
                    </span>
                </div>

            </div>
        </div>
    );
}

export default StartPage;