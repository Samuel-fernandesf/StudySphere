import React from "react";

export default function UploadDropzone({ onUpload }) {
  async function handleChange(e) {
    const file = e.target.files[0];
    if (file && onUpload) await onUpload(file);
  }
  return (
    <div style={{ background:"white", padding:12, borderRadius:8 }}>
      <input type="file" onChange={handleChange} />
    </div>
  );
}
