import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import Login from './pages/Login.jsx';
import Signup from './pages/Signup.jsx';
import Onboarding from './pages/Onboarding.jsx';
import Dashboard from './pages/Dashboard.jsx';

function App() {
    return (
        <BrowserRouter>
            <nav className="navbar">
                <Link to="/">Login</Link>
                <Link to="/signup">Signup</Link>
                <Link to="/onboarding">Onboarding</Link>
                <Link to="/dashboard">Dashboard</Link>
            </nav>

            <Routes>
                <Route path="/" element={<Login />} />
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="/onboarding" element={<Onboarding />} />
                <Route path="/dashboard" element={<Dashboard />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;