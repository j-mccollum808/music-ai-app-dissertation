import express from "express";
import cors from "cors";
import { v4 as uuidv4 } from "uuid";
import path from "path";
import fs from "fs";
import ytdlp from "yt-dlp-exec";
import ffmpeg from "fluent-ffmpeg";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

const TMP_DIR = path.join(__dirname, "tmp");
if (!fs.existsSync(TMP_DIR)) fs.mkdirSync(TMP_DIR);

app.post("/youtube-to-mp3", async (req, res) => {
  const { url } = req.body;
  if (!url) return res.status(400).json({ error: "Missing YouTube URL" });

  const tempId = uuidv4();
  const rawAudioPath = path.join(TMP_DIR, `${tempId}.webm`);
  const mp3Path = path.join(TMP_DIR, `${tempId}.mp3`);

  try {
    // Step 1: Download audio as .webm using yt-dlp
    await ytdlp(url, {
      format: "bestaudio",
      output: rawAudioPath,
    });

    // Step 2: Convert .webm to .mp3 using ffmpeg
    ffmpeg(rawAudioPath)
      .audioBitrate(128)
      .toFormat("mp3")
      .on("error", (err) => {
        console.error("FFmpeg error:", err.message);
        res.status(500).json({ error: "Conversion failed" });
      })
      .on("end", () => {
        console.log("✅ MP3 saved:", mp3Path);
        res.json({ mp3Path: `http://localhost:${PORT}/download/${tempId}.mp3` });

        // Optional cleanup of original .webm
        fs.unlink(rawAudioPath, () => {});
      })
      .save(mp3Path);
  } catch (err) {
    console.error("yt-dlp or ffmpeg error:", err.message);
    res.status(500).json({ error: "Download or conversion failed" });
  }
});

app.use("/download", express.static(TMP_DIR));

app.listen(PORT, () => {
  console.log(`🎵 YouTube MP3 server running at http://localhost:${PORT}`);
});
