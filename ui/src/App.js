import './App.css';
import LoginPage from "./pages/LoginPage";
import {Router} from "react-location";
import RegisterPage from "./pages/RegisterPage";
import {ReactLocation} from "react-location";
import WelcomePage from "./pages/WelcomePage";


function App() {

    const location = new ReactLocation();

  return (
    <Router location={location} routes={[
        {
            path: '/login',
            element: <LoginPage />
        },
        {
            path: '/register',
            element: <RegisterPage />
        },
        {
            path: '/welcome',
            element: <WelcomePage />
        }
    ]}
    />
  );
}

export default App;
