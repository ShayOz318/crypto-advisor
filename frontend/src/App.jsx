import { BrowserRouter, Routes, Route, Link, Navigate, useLocation } from "react-router-dom";
import Login from "./pages/Login.jsx";
import Signup from "./pages/Signup.jsx";
import Onboarding from "./pages/Onboarding.jsx";
import Dashboard from "./pages/Dashboard.jsx";

function RequireAuth({ children }) {
    const location = useLocation();
    const token = localStorage.getItem("token");

    if (!token) {
        return <Navigate to="/" replace state={{ from: location }} />;
    }

    return children;
}

function PublicOnly({ children }) {
    const token = localStorage.getItem("token");
    if (token) {
        return <Navigate to="/dashboard" replace />;
    }
    return children;
}

function NavBar() {
    const isAuthed = Boolean(localStorage.getItem("token"));

    return (
        <nav className="navbar">
            {!isAuthed ? (
                <div className="navbar-links">
                    <Link to="/">Login</Link>
                    <Link to="/signup">Signup</Link>
                </div>
            ) : (
                <>
                    <div className="navbar-links">
                        <Link to="/dashboard">Dashboard</Link>
                        <Link to="/onboarding">Preferences</Link>
                    </div>
                    <button
                        className="navbar-logout"
                        type="button"
                        onClick={() => {
                            localStorage.removeItem("token");
                            localStorage.removeItem("userName");
                            window.location.href = "/";
                        }}
                    >
                        Logout
                    </button>
                </>
            )}
        </nav>
    );
}

function App() {
    return (
        <BrowserRouter>
            <NavBar />

            <Routes>
                <Route
                    path="/"
                    element={
                        <PublicOnly>
                            <Login />
                        </PublicOnly>
                    }
                />
                <Route
                    path="/signup"
                    element={
                        <PublicOnly>
                            <Signup />
                        </PublicOnly>
                    }
                />
                <Route
                    path="/onboarding"
                    element={
                        <RequireAuth>
                            <Onboarding />
                        </RequireAuth>
                    }
                />
                <Route
                    path="/dashboard"
                    element={
                        <RequireAuth>
                            <Dashboard />
                        </RequireAuth>
                    }
                />
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;