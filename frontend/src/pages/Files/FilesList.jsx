import React from "react";
import Header from "../../components/layout/Header";
import UploadDropzone from "../../components/file/UploadDropzone";
import FileCard from "../../components/file/FileCard";
import { listarArquivos, enviarArquivo } from "../../services/fileService";
import useFetch from "../../hooks/useFetch";

export default function FilesList() {
  const { data, carregando } = useFetch(listarArquivos, []);

  async function handleUpload(file) {
    await enviarArquivo(file);
    alert("Upload concluído (exemplo). Atualize a página para ver mudanças.");
  }

  return (
    <>
      <Header />
      <main className="container">
        <h2>Arquivos</h2>
        <UploadDropzone onUpload={handleUpload} />
        <div style={{ marginTop:12 }}>
          {carregando && <div>Carregando...</div>}
          {data && data.map((f, i) => <FileCard key={i} arquivo={f} />)}
        </div>
      </main>
    </>
  );
}
