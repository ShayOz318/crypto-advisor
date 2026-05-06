import { BrowserRouter, Routes, Route, Link, Navigate, useLocation } from "react-router-dom";
import Login from "./pages/Login.jsx";
import Signup from "./pages/Signup.jsx";
import Onboarding from "./pages/Onboarding.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Settings from "./pages/Settings.jsx";

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
                    <div className="navbar-spacer" />
                    <div className="navbar-links">
                        <Link to="/dashboard">Dashboard</Link>
                    </div>
                    <div className="navbar-right">
                        <Link
                            className="navbar-settings"
                            to="/settings"
                            aria-label="Settings"
                            title="Settings"
                        >
                            ⚙
                        </Link>
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
                    </div>
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
                <Route
                    path="/settings"
                    element={
                        <RequireAuth>
                            <Settings />
                        </RequireAuth>
                    }
                />
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;