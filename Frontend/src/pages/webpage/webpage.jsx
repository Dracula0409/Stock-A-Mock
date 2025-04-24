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
        <div className='webPageBody'>
            <div className='container'>

                <div className='welcome'>
                    <h1 className='title'>Stock-A-Mock</h1>
                    <h3 className='welcome-msg'>What will be it today? A bull run or bear run...</h3>
                    <span className='Enter-App'>
                        <p>Already Been Here? Welcome back!</p>
                        <button className='login-btn' onClick={HandleLogin}>Login</button>
                        <p>But you'll have to prove yourself first...</p>
                    </span>
                    <span className='New-App'>
                        <p>New Here? Say no more!</p>
                        <button className='signup-btn' onClick={HandleSignUp}>Sign up</button>
                        <p>It's Free...</p>
                    </span>
                </div>

            </div>
        </div>
    );
}

export default StartPage;