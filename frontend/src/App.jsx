import React from "react";
import { BrowserRouter } from "react-router-dom";
import AppRoutes from "./router/AppRoutes";
import { AuthProvider } from "./contexts/AuthContext";
import Layout from "./components/layout/Layout";
import { SocketProvider } from "./contexts/SocketContext";

// CÓDIGO CORRIGIDO
export default function App() {
  return (
    <BrowserRouter> 
      <AuthProvider>
        <Layout>
          <SocketProvider>
              <AppRoutes/>
          </SocketProvider>
        </Layout>
      </AuthProvider>
    </BrowserRouter>
  );
}