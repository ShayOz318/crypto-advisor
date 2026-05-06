import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { signup } from "../api/api.js";

function Signup() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const navigate = useNavigate();

    const handleSignup = async (e) => {
        e.preventDefault();

        try {
            await signup(name.trim(), email.trim(), password);
            alert("Signup successful. Please login.");
            navigate("/");
        } catch (error) {
            const message = error instanceof Error ? error.message : "Unknown error";
            alert(`Signup failed: ${message}`);
        }
    };

    return (
        <div className="page">
            <h1>Create Account</h1>
            <p>Already have an account? <Link to="/">Back to login</Link></p>

            <form onSubmit={handleSignup}>
                <input
                    type="text"
                    placeholder="Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                />

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

                <button type="submit">Sign Up</button>
            </form>
        </div>
    );
}

export default Signup;