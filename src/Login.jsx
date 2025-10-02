import { useState } from "react";

export default function Login({ onLogin }) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    const handleSubmit = (e) => {
        e.preventDefault();

        // Default user credentials
        if (email === "admin@admin.admin" && password === "admin") {
            onLogin(); 
        } else {
            setError("Invalid email or password");
        }
    };

    return (
        <div style={{ textAlign: "center", marginTop: "5rem" }}>
            <h2>Login</h2>
            <form onSubmit={handleSubmit}>
                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                /><br /><br />
                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                /><br /><br />
                <button type="submit">Login</button>
            </form>
            {error && <p style={{ color: "red" }}>{error}</p>}
            <p>Default user: admin@admin.admin / admin</p>
        </div>
    );
}
