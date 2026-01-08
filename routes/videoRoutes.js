const express = require("express");
const multer = require("multer");
const QRCode = require("qrcode");
const path = require("path");
const fs = require("fs");
const Video = require("../models/Video");

const router = express.Router();

/* -------------------- Multer Configuration -------------------- */
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + "-" + file.originalname;
    cb(null, uniqueName);
  },
});

const upload = multer({ storage });

/* -------------------- Upload Video -------------------- */
router.post("/upload", upload.single("video"), async (req, res) => {
  try {
    const video = new Video({
      title: req.body.title,
      filename: req.file.filename,
      filepath: req.file.path,
      mimetype: req.file.mimetype,
      size: req.file.size,
    });

    await video.save();

    res.status(201).json({
      message: "Video uploaded successfully ✅",
      video,
    });
  } catch (error) {
    res.status(500).json({ message: "Video upload failed ❌", error });
  }
});

/* -------------------- Generate & Save QR Code -------------------- */
router.get("/qr/:id", async (req, res) => {
  try {
    const video = await Video.findById(req.params.id);

    if (!video) {
      return res.status(404).json({ message: "Video not found ❌" });
    }

    // Fix Windows backslashes
    const cleanPath = video.filepath.replace(/\\/g, "/");

    // Video URL
    const videoUrl = `${req.protocol}://${req.get("host")}/${cleanPath}`;

    // Ensure QR directory exists
    const qrDir = path.join(__dirname, "../uploads/qr");
    if (!fs.existsSync(qrDir)) {
      fs.mkdirSync(qrDir, { recursive: true });
    }

    const qrFileName = `${video._id}.png`;
    const qrFilePath = path.join(qrDir, qrFileName);

    // Save QR image
    await QRCode.toFile(qrFilePath, videoUrl);

    // Save QR path in MongoDB
    video.qrPath = `uploads/qr/${qrFileName}`;
    await video.save();

    res.json({
      message: "QR code generated & saved successfully ✅",
      videoUrl,
      qrImage: `${req.protocol}://${req.get("host")}/${video.qrPath}`,
    });
  } catch (error) {
    res.status(500).json({ message: "QR generation failed ❌", error });
  }
});

/* -------------------- Get All Videos -------------------- */
router.get("/", async (req, res) => {
  const videos = await Video.find().sort({ createdAt: -1 });
  res.json(videos);
});

module.exports = router;
