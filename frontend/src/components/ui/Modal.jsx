import React from "react";

export default function Modal({ children, aberto, onFechar }) {
  if (!aberto) return null;
  return (
    <div style={{
      position:"fixed", inset:0, display:"flex", alignItems:"center", justifyContent:"center",
      background:"rgba(0,0,0,0.4)"
    }}>
      <div style={{ background:"white", padding:20, borderRadius:8, minWidth:300 }}>
        {children}
        <div style={{ marginTop:12, textAlign:"right" }}>
          <button onClick={onFechar}>Fechar</button>
        </div>
      </div>
    </div>
  );
}
