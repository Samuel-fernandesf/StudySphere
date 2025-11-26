import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: { 
    port: 3000, 
    host: '0.0.0.0',
    proxy: { 
      "/api": "http://127.0.0.1:5000" 
    },
    allowedHosts: [
      "3002-itiyqsw0nj6qb34ryqa9v-a50f3101.manusvm.computer",
      "3001-itiyqsw0nj6qb34ryqa9v-a50f3101.manusvm.computer",
      "3001-icthamcq6he50k3y9etnr-758e880b.manusvm.computer",
      "3002-icthamcq6he50k3y9etnr-758e880b.manusvm.computer",
      "3015-icthamcq6he50k3y9etnr-758e880b.manusvm.computer",
      "3014-icthamcq6he50k3y9etnr-758e880b.manusvm.computer",
      "3013-icthamcq6he50k3y9etnr-758e880b.manusvm.computer",
      "3012-icthamcq6he50k3y9etnr-758e880b.manusvm.computer",
      "3011-icthamcq6he50k3y9etnr-758e880b.manusvm.computer",
      "3010-icthamcq6he50k3y9etnr-758e880b.manusvm.computer",
      "3009-icthamcq6he50k3y9etnr-758e880b.manusvm.computer",
      "3008-icthamcq6he50k3y9etnr-758e880b.manusvm.computer",
      "3007-icthamcq6he50k3y9etnr-758e880b.manusvm.computer",
      "3006-icthamcq6he50k3y9etnr-758e880b.manusvm.computer",
      "3005-icthamcq6he50k3y9etnr-758e880b.manusvm.computer",
      "3004-icthamcq6he50k3y9etnr-758e880b.manusvm.computer",
      "3003-icthamcq6he50k3y9etnr-758e880b.manusvm.computer",
      "3002-icthamcq6he50k3y9etnr-758e880b.manusvm.computer",
      "3015-icthamcq6he50k3y9etnr-758e880b.manusvm.computer",
      "3014-icthamcq6he50k3y9etnr-758e880b.manusvm.computer",
      "3013-icthamcq6he50k3y9etnr-758e880b.manusvm.computer",
      "3012-icthamcq6he50k3y9etnr-758e880b.manusvm.computer",
      "3011-icthamcq6he50k3y9etnr-758e880b.manusvm.computer",
      "3010-icthamcq6he50k3y9etnr-758e880b.manusvm.computer",
      "3009-icthamcq6he50k3y9etnr-758e880b.manusvm.computer",
      "3008-icthamcq6he50k3y9etnr-758e880b.manusvm.computer",
      "3007-icthamcq6he50k3y9etnr-758e880b.manusvm.computer",
      "3006-icthamcq6he50k3y9etnr-758e880b.manusvm.computer",
      "3005-icthamcq6he50k3y9etnr-758e880b.manusvm.computer",
      "3004-icthamcq6he50k3y9etnr-758e880b.manusvm.computer"
    ]
  }
});
