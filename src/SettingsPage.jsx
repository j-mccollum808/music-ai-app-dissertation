// src/SettingsPage.jsx
import { useChordView } from "./contexts/ChordViewContext";

export default function SettingsPage() {
  const { simplification, setSimplification } = useChordView();

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Settings</h1>

      <label className="block mb-2 font-medium">Chord Simplification:</label>
      <select
        value={simplification}
        onChange={(e) => setSimplification(e.target.value)}
        className="border p-2 rounded"
      >
        <option value="basic">Basic</option>
        <option value="simple">Simple</option>
        <option value="complex">Complex</option>
      </select>
    </div>
  );
}
