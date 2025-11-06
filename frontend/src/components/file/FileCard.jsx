import React from "react";

export default function FileCard({ arquivo }) {
  return (
    <div style={{ background:"white", padding:12, borderRadius:8, marginBottom:12 }}>
      <strong>{arquivo.nome}</strong>
      <div style={{ fontSize:12, color:"#6b7280" }}>{arquivo.tamanho || "—"}</div>
    </div>
  );
}
