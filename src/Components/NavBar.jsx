import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

function NavBar() {
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);
  const buttonRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    function onClickOutside(e) {
      if (
        menuRef.current &&
        !menuRef.current.contains(e.target) &&
        buttonRef.current &&
        !buttonRef.current.contains(e.target)
      ) {
        setOpen(false);
      }
    }
    function onEsc(e) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    document.addEventListener("keydown", onEsc);
    return () => {
      document.removeEventListener("mousedown", onClickOutside);
      document.removeEventListener("keydown", onEsc);
    };
  }, []);

  const MenuItem = ({ icon, label, onClick }) => {
    return (
      <button
        type="button"
        onClick={onClick}
        className="menu-item"
      >
        {icon}
        <span>{label}</span>
      </button>
    );
  };

  return (
    <nav className="navbar">
      <div className="brand">GreenMeals</div>

      <div className="profile-wrapper">
        <button
          ref={buttonRef}
          aria-haspopup="menu"
          aria-expanded={open}
          aria-label="User menu"
          onClick={() => setOpen(v => !v)}
          className="profile-button"
        >
          {/* default user circle icon */}
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <path
              d="M12 12c2.761 0 5-2.239 5-5s-2.239-5-5-5-5 2.239-5 5 2.239 5 5 5Zm0 2c-4.418 0-8 2.239-8 5v1h16v-1c0-2.761-3.582-5-8-5Z"
              fill="#111827"
            />
          </svg>
        </button>

        {open && (
          <div ref={menuRef} role="menu" className="profile-menu">
            <MenuItem
              label="Profile"
              onClick={() => {
                setOpen(false);
                navigate("/profile");
              }}
              icon={
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M12 12a5 5 0 1 0-5-5 5 5 0 0 0 5 5Zm0 2c-4.5 0-8 2.25-8 5v1h16v-1c0-2.75-3.5-5-8-5Z" fill="#111827"/>
                </svg>
              }
            />
            <MenuItem
              label="Orders"
              onClick={() => {
                setOpen(false);
                navigate("/Orders");
              }}
              icon={
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M6 2h12a2 2 0 0 1 2 2v16l-8-4-8 4V4a2 2 0 0 1 2-2Z" fill="#111827"/>
                </svg>
              }
            />
            <div className="divider" />
            <MenuItem
              label="Logout"
              onClick={() => {
                setOpen(false);
                // user logout (if we want)
              }}
              icon={
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M10 17v2H4a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h6v2H4v10h6Zm9-5-3-3v2h-6v2h6v2l3-3Z" fill="#b91c1c"/>
                </svg>
              }
            />
          </div>
        )}
      </div>
    </nav>
  );
}

export default NavBar;