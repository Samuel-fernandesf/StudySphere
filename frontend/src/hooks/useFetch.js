import { useState, useEffect } from "react";

// Hook genérico para buscar dados
export default function useFetch(fn, deps = []) {
  const [data, setData] = useState(null);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState(null);

  useEffect(() => {
    let ativo = true;
    setCarregando(true);
    fn()
      .then((r) => { if (ativo) setData(r); })
      .catch((e) => { if (ativo) setErro(e); })
      .finally(() => { if (ativo) setCarregando(false); });

    return () => (ativo = false);
  }, deps);

  return { data, carregando, erro };
}
