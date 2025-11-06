import React from "react";
import Header from "../../components/layout/Header";
import Sidebar from "../../components/layout/Sidebar";
import Overview from "./Overview";

export default function Dashboard() {
  return (
    <>
      <Header />
      <main className="container" style={{ display:"flex", gap:20 }}>
        <Sidebar>
          <p><strong>Menu</strong></p>
          <p>Links</p>
        </Sidebar>
        <div style={{ flex:1 }}>
          <h2>Dashboard</h2>
          <Overview />
        </div>
      </main>
    </>
  );
}
