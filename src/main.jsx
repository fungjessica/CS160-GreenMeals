import { StrictMode, useState } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";      // map + search component
import Login from "./Login";  // login page

function Main() {
    const [loggedIn, setLoggedIn] = useState(false);

    return (
        <>
            {!loggedIn ? (
                <Login onLogin={() => setLoggedIn(true)} />
            ) : (
                <App />
            )}
        </>
    );
}

const root = createRoot(document.getElementById("root"));
root.render(
    <StrictMode>
        <Main />
    </StrictMode>
);
