const express = require("express");
const multer = require("multer");
const cors = require("cors");
const path = require("path");

const app = express();
app.use(cors());
app.use(express.json());

// allow serving uploaded images
app.use("/uploads", express.static("uploads"));

// handle image uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    const unique = Date.now() + path.extname(file.originalname);
    cb(null, unique);
  }
});

const upload = multer({ storage: storage });

// POST /upload endpoint
app.post("/upload", upload.single("profilePic"), (req, res) => {
  const file = req.file;

  if (!file)
    return res.status(400).json({ error: "No file uploaded" });

  const fileUrl = `${req.protocol}://${req.get("host")}/uploads/${file.filename}`;

  res.json({
    message: "Uploaded successfully",
    url: fileUrl
  });
});

app.get("/", (req, res) => {
  res.send("Backend is running online!");
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});