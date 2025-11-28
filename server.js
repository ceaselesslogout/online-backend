const express = require("express");
const multer = require("multer");
const cors = require("cors");
const path = require("path");
const fs = require("fs");

const app = express();
app.use(cors());
app.use(express.json());

// serve images
app.use("/uploads", express.static("uploads"));

// ---------- Load & Save Users ----------
function loadUsers() {
    if (!fs.existsSync("users.json")) return [];
    return JSON.parse(fs.readFileSync("users.json"));
}

function saveUsers(data) {
    fs.writeFileSync("users.json", JSON.stringify(data, null, 2));
}

// ---------- MULTER UPLOAD ----------
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({ storage });

// ---------- ROUTES ----------

// GET ALL USERS
app.get("/users", (req, res) => {
    res.json(loadUsers());
});

// REGISTER
app.post("/register-no-pic", (req, res) => {
    const { username, password } = req.body;

    let users = loadUsers();

    const newUser = {
        id: Date.now(),
        username,
        password,
        profilePic: "/uploads/default.png"
    };

    users.push(newUser);
    saveUsers(users);

    res.json({ message: "User created", user: newUser });
});

// upload profile pic
app.post("/upload-profile", upload.single("profilePic"), (req, res) => {
    const { userId } = req.body;
    const filename = req.file.filename;

    let users = loadUsers();
    let user = users.find(u => u.id == userId);

    if (!user) return res.status(400).json({ error: "User not found" });

    user.profilePic = "/uploads/" + filename;

    saveUsers(users);

    res.json({ message: "Profile updated", user });
});

app.get("/", (req, res) => {
    res.send("Backend is running online!");
});

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});