import React from "react";
import { BrowserRouter } from "react-router-dom";
import AppRoutes from "./router/AppRoutes";
import { AuthProvider } from "./contexts/AuthContext";
import Layout from "./components/layout/Layout";
import { SocketProvider } from "./contexts/SocketContext";

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <SocketProvider>
          <Layout>
            <AppRoutes/>
          </Layout>
        </SocketProvider>
      </BrowserRouter>
    </AuthProvider>
  );
}
