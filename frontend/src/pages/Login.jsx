import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
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
            if (data.user?.name) {
                localStorage.setItem("userName", data.user.name);
            }
            const needsOnboarding = data.needsOnboarding !== false;
            navigate(needsOnboarding ? "/onboarding" : "/dashboard");
        } catch (error) {
            alert(error.message || "Login failed");
        }
    };

    return (
        <div className="page">
            <h1>Login</h1>
            <p>Don&apos;t have an account? <Link to="/signup">Sign up</Link></p>

            <form onSubmit={handleLogin}>
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

                <button type="submit">Login</button>
            </form>
        </div>
    );
}

export default Login;