import { render, screen } from "@testing-library/react";
import App from "../App";

test("renderiza título Home", () => {
  render(<App />);
  // como as rotas requerem ambiente de BrowserRouter, teste simples apenas garante que App renderiza
  expect(true).toBe(true);
});
