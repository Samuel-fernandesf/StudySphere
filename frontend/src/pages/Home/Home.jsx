import React from "react";
import Header from "../../components/layout/Header";
import Footer from "../../components/layout/Footer";

export default function Home() {
  return (
    <>
      <Header />
      <main className="container">
        <h1>Bem-vindo ao StudySphere</h1>
        <p>Plataforma de exemplo com frontend em React + Vite.</p>
      </main>
      <Footer />
    </>
  );
}
