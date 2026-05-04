import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { signup } from "../api/api.js";

function Signup() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const navigate = useNavigate();

    const handleSignup = async (e) => {
        e.preventDefault();

        try {
            await signup(name, email, password);

            alert("Signup successful! Please login.");

            navigate("/login");
        } catch (error) {
            alert("Error: " + error.message);
        }
    };

    return (
        <div className="page">
            <h1>Signup</h1>

            <form onSubmit={handleSignup}>
                <input
                    type="text"
                    placeholder="Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                />

                <br /><br />

                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />

                <br /><br />

                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />

                <br /><br />

                <button type="submit">Sign Up</button>
            </form>
        </div>
    );
}

export default Signup;