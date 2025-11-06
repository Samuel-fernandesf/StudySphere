import React from "react";

export default function Sidebar({ children }) {
  return (
    <aside style={{ width:240, marginRight:20 }}>
      <div style={{ background:"white", padding:12, borderRadius:8 }}>
        {children}
      </div>
    </aside>
  );
}
