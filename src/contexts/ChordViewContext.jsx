// src/contexts/ChordViewContext.jsx
import { createContext, useContext, useState } from "react";

const ChordViewContext = createContext();

export function ChordViewProvider({ children }) {
  const [simplification, setSimplification] = useState("complex"); // default

  return (
    <ChordViewContext.Provider value={{ simplification, setSimplification }}>
      {children}
    </ChordViewContext.Provider>
  );
}

export function useChordView() {
  return useContext(ChordViewContext);
}
