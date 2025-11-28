const express = require("express");
const multer = require("multer");
const cors = require("cors");
const path = require("path");
const fs = require("fs");

const app = express();
app.use(cors());
app.use(express.json());

// PUBLIC UPLOADS FOLDER
app.use("/uploads", express.static("uploads"));

// READ users.json
function loadUsers() {
    let data = fs.readFileSync("users.json");
    return JSON.parse(data);
}

// WRITE users.json
function saveUsers(users) {
    fs.writeFileSync("users.json", JSON.stringify(users, null, 2));
}

// MULTER STORAGE
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    const name = Date.now() + path.extname(file.originalname);
    cb(null, name);
  }
});

const upload = multer({ storage });

// ROUTE 1: REGISTER WITHOUT PIC
app.post("/register-no-pic", (req, res) => {
    const { username, password } = req.body;

    let users = loadUsers();

    const newUser = {
        id: Date.now(),
        username,
        password,
        profilePic: "/uploads/default.png"  // default image
    };

    users.push(newUser);
    saveUsers(users);

    res.json({ message: "User created", user: newUser });
});

// ROUTE 2: UPDATE PROFILE PIC
app.post("/upload-profile", upload.single("profilePic"), (req, res) => {
    const { userId } = req.body;
    const fileName = req.file.filename;

    let users = loadUsers();
    let user = users.find(u => u.id == userId);

    if (!user) return res.json({ error: "User not found" });

    user.profilePic = `/uploads/${fileName}`;
    saveUsers(users);

    res.json({ message: "Profile picture updated", user });
});

// ROUTE 3: GET ALL USERS
app.get("/users", (req, res) => {
  res.json(loadUsers());
});

// TEST ROUTE
app.get("/", (req, res) => {
  res.send("Backend is running online!");
});

// START SERVER
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});