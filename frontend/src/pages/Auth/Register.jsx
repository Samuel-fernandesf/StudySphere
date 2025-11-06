import React, { useState } from "react";
import Header from "../../components/layout/Header";
import { register } from "../../services/authService";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";

export default function Register() {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      await register({ nome, email, senha });
      alert("Registro concluído. Faça login.");
    } catch (err) { alert("Erro no registro"); }
  }

  return (
    <>
      <Header />
      <main className="container" style={{ maxWidth:600 }}>
        <h2>Registrar</h2>
        <form onSubmit={handleSubmit}>
          <label>Nome</label>
          <Input value={nome} onChange={e=>setNome(e.target.value)} />
          <label>Email</label>
          <Input value={email} onChange={e=>setEmail(e.target.value)} />
          <label>Senha</label>
          <Input type="password" value={senha} onChange={e=>setSenha(e.target.value)} />
          <div style={{ marginTop:12 }}>
            <Button type="submit">Registrar</Button>
          </div>
        </form>
      </main>
    </>
  );
}
