import {BrowserRouter as Router, Routes, Route} from "react-router-dom";
import StartPage from "./pages/webpage/webpage.jsx";
import Login from './pages/login/login.jsx'
import Forgot from './pages/forgotPass/enterOTP.jsx'
import Reset from './pages/forgotPass/newPass.jsx'
import Signup from "./pages/signup/signup.jsx";
import VerifyEmail from './pages/signup/verifyEmail.jsx';
import Dashboard from "./pages/dashboard/portfolio.jsx";
import Buy from "./pages/transactions/buy.jsx";
//import Sell from "./pages/transactions/sell.jsx";
//import Stocks from "./pages/stocks/stocks.jsx";
//import Account from "./pages/user/account.jsx";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<StartPage/>}/>
        <Route path="/dashboard" element={<Dashboard/>}/>
        <Route path="/login" element={ <Login/>} />
        <Route path="/forgotPass" element={ <Forgot/> } />
        <Route path="/newPass" element={ <Reset/> } />
        <Route path="/signup" element={ <Signup/> } />
        <Route path="/verifyEmail" element={ <VerifyEmail/> } />
        <Route path="/buy" element={ <Buy/> } />
        {/*
        <Route path="/sell" element={ <Sell/> } />
        <Route path="/search" element={ <Stocks/> } />
        <Route path="/account" element={ <Account/> } />
        */}
      </Routes>
    </Router>
  );
}

export default App;