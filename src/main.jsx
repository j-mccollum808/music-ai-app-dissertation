import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { ChordViewProvider } from "./contexts/ChordViewContext.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <ChordViewProvider>
      <App />
    </ChordViewProvider>
  </StrictMode>
);
