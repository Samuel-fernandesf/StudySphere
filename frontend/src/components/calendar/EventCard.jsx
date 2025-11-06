import React from "react";

export default function EventCard({ evento }) {
  return (
    <div style={{ background:"#fff", padding:8, borderRadius:6, marginBottom:8 }}>
      <div><strong>{evento.titulo}</strong></div>
      <div style={{ fontSize:12 }}>{evento.data}</div>
    </div>
  );
}
