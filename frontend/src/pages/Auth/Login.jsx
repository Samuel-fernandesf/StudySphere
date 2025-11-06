import React, { useState } from "react";
import Header from "../../components/layout/Header";
import { useNavigate } from "react-router-dom";
import { login } from "../../services/authService";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";

export default function Login() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      const data = await login(email, senha);
      // salvar sessão simples
      localStorage.setItem("user_id", data.user_id || "1");
      localStorage.setItem("access_token", data.access_token || "");
      navigate("/dashboard");
    } catch (err) {
      alert("Erro ao logar");
    }
  }

  return (
    <>
      <Header />
      <main className="container">
        <h2>Login</h2>
        <form onSubmit={handleSubmit} style={{ maxWidth:420 }}>
          <label>Email</label>
          <Input value={email} onChange={e=>setEmail(e.target.value)} />
          <label>Senha</label>
          <Input type="password" value={senha} onChange={e=>setSenha(e.target.value)} />
          <div style={{ marginTop:12 }}>
            <Button type="submit">Entrar</Button>
          </div>
        </form>
      </main>
    </>
  );
}
