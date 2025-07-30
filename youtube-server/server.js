const express = require("express");
const cors = require("cors");
const { v4: uuidv4 } = require("uuid");
const path = require("path");
const fs = require("fs");
const ytdlp = require("yt-dlp-exec");
const ffmpeg = require("fluent-ffmpeg");

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
  const outputMp3 = path.join(TMP_DIR, `${tempId}.mp3`);

  const ytdlpProc = ytdlp(url, {
  format: "bestaudio",
  output: "-",
  stdout: "pipe"
});

  const ffmpegProc = ffmpeg(ytdlpProc)
    .audioBitrate(128)
    .toFormat("mp3")
    .on("error", (err) => {
      console.error("FFmpeg error:", err);
      res.status(500).json({ error: "Conversion failed" });
    })
    .on("end", () => {
      console.log("MP3 saved:", outputMp3);
      res.json({ mp3Path: `http://localhost:${PORT}/download/${tempId}.mp3` });
    })
    .save(outputMp3);
});

app.use("/download", express.static(TMP_DIR));

app.listen(PORT, () => {
  console.log(`✅ YouTube MP3 server running at http://localhost:${PORT}`);
});
