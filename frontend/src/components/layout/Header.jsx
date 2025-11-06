import React from "react";
import { Link } from "react-router-dom";

export default function Header() {
  return (
    <header style={{ marginBottom:16 }}>
      <div className="container" style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
        <div><Link to="/"><strong>StudySphere</strong></Link></div>
        <nav>
          <Link to="/dashboard" style={{ marginRight:12 }}>Dashboard</Link>
          <Link to="/files" style={{ marginRight:12 }}>Arquivos</Link>
          <Link to="/calendar" style={{ marginRight:12 }}>Calendário</Link>
        </nav>
      </div>
    </header>
  );
}
