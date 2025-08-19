import { useRef, useState } from "react";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { storage } from "../api/firebase";

export default function FileUploader({
  onComplete,
  accept = "audio/mpeg,.mp3",
}) {
  const [file, setFile] = useState(null);
  const [progress, setProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef(null);
  const urlInputRef = useRef(null);

  const choose = () => fileInputRef.current?.click();

  const handleDrop = (e) => {
    e.preventDefault();
    const f = e.dataTransfer.files?.[0];
    if (f) setFile(f);
  };

  const uploadFromUrl = async () => {
    const url = urlInputRef.current?.value?.trim();
    if (!url) return;
    try {
      const resp = await fetch(url);
      if (!resp.ok) throw new Error(`Failed to fetch: ${resp.status}`);
      const blob = await resp.blob();
      const name = url.split("/").pop()?.split("?")[0] || "remote.mp3";
      setFile(new File([blob], name, { type: blob.type || "audio/mpeg" }));
    } catch (e) {
      setError(e.message);
    }
  };

  const startUpload = async () => {
    if (!file) return;
    setError("");
    setUploading(true);
    setProgress(0);
    const pathRef = ref(storage, `audio-uploads/${Date.now()}-${file.name}`);
    const task = uploadBytesResumable(pathRef, file);
    task.on(
      "state_changed",
      (snap) =>
        setProgress(
          Math.round((snap.bytesTransferred / snap.totalBytes) * 100)
        ),
      (err) => {
        setError(err.message);
        setUploading(false);
      },
      async () => {
        const publicUrl = await getDownloadURL(task.snapshot.ref);
        setUploading(false);
        onComplete?.({ file, publicUrl });
      }
    );
  };

  return (
    <div className="w-full max-w-xl rounded-2xl border border-[#2f394b] bg-grey p-4 shadow-sm">
      {" "}
      <div
        className="h-40 flex items-center justify-center rounded-xl border-2 border-dashed border-[#2f394b] bg-[#1e2633] cursor-pointer"
        onClick={choose}
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
      >
        <div className="text-center text-sm text-gray-600">
          Drag & Drop or{" "}
          <span className="text-indigo-600 underline">Choose file</span> to
          upload
          <div className="text-xs text-gray-400 mt-1">{accept}</div>
        </div>
        <input
          ref={fileInputRef}
          className="hidden"
          type="file"
          accept={accept}
          onChange={(e) => setFile(e.target.files?.[0] || null)}
        />
      </div>
      {file && (
        <div className="mt-3 rounded-xl border border-gray-200 p-3">
          <div className="flex justify-between text-sm">
            <span className="truncate">{file.name}</span>
            <span className="text-gray-500">
              {Math.ceil(file.size / 1024)} KB
            </span>
          </div>
          <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-gray-100">
            <div
              className="h-full rounded-full bg-indigo-600 transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="mt-2 flex gap-2">
            <button
              className="rounded-xl border px-3 py-1 text-sm"
              onClick={() => setFile(null)}
              disabled={uploading}
            >
              Cancel
            </button>
            <button
              className="ml-auto rounded-xl bg-indigo-600 px-3 py-1 text-sm text-grey disabled:opacity-50"
              onClick={startUpload}
              disabled={uploading}
            >
              {uploading ? "Uploading…" : "Import"}
            </button>
          </div>
        </div>
      )}
      {error && <div className="mt-2 text-xs text-red-600">{error}</div>}
    </div>
  );
}
