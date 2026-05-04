import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { login } from "../api/api.js";

function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();

        try {
            const data = await login(email, password);
            localStorage.setItem("token", data.token);

            alert("Login successful!");
            navigate("/onboarding");
        } catch (error) {
            alert("Error: " + error.message);
        }
    };

    return (
        <div className="page">
            <h1>Welcome to Crypto Advisor</h1>
            <p>Login to view your personalized crypto dashboard.</p>

            <form onSubmit={handleLogin}>
                <h2>Login</h2>

                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />

                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />

                <button type="button" onClick={() => navigate("/dashboard")}>
                    Continue without login
                </button>

                <button type="submit">Login</button>

                <p>
                    Not registered yet?
                </p>

                <Link to="/signup">
                    <button type="button">Sign up</button>
                </Link>
            </form>
        </div>
    );
}

export default Login;