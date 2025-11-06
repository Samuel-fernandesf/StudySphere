import React from "react";

export default function Button({ children, onClick, type = "button" }) {
  return (
    <button onClick={onClick} type={type} style={{
      background: "var(--primary)",
      color: "white",
      padding: "8px 12px",
      borderRadius: 6,
      border: "none",
      cursor: "pointer"
    }}>
      {children}
    </button>
  );
}
