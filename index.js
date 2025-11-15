const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");
const app = express();
const PORT = 3000;

const users = []; 

app.use(express.static(path.join(__dirname, "public")));

/*app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Bejelentkezés kezelése
app.post("/login", (req, res) => {
    const { username, password } = req.body;
    const user = users.find(u => u.username === username && u.password === password);
    if(user) {
        res.json({ success: true, message: `Szia ${username}, sikeresen bejelentkeztél!` });
    } else {
        res.json({ success: false, message: "Hibás felhasználónév vagy jelszó!" });
    }
});

// Regisztráció kezelése
app.post("/register", (req, res) => {
    const { username, password } = req.body;
    if(users.find(u => u.username === username)) {
        res.json({ success: false, message: "Ez a felhasználónév már foglalt!" });
    } else {
        users.push({ username, password });
        res.json({ success: true, message: `Sikeresen regisztráltál: ${username}` });
    }
});*/

app.listen(PORT, () => {
    console.log(`Szerver fut: http://localhost:${PORT}`);
});
