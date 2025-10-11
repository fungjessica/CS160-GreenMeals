import React, { useState } from "react";
import "./Login.css";
import { useNavigate } from "react-router-dom";

export default function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate();

    const handleSubmit = (e) => {
        e.preventDefault();
        if (email === "admin@admin.admin" && password === "admin") {
            alert("Welcome back, admin!");
            navigate("/map"); // Redirect to map page
        } else {
            alert("Invalid credentials!");
        }
    };

    return (
        <div className="login-container">
            <div className="login-box">
                <h1>GreenMeals Login</h1>
                <form onSubmit={handleSubmit}>
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
                <p>
                    Don’t have an account? <a href="/register">Register</a>
                </p>
            </div>
        </div>
    );
}
