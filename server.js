const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const PORT = 3000;

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// Egyszerű regisztrációs végpont
app.post('/register', (req, res) => {
    const { username, email, password } = req.body;
    // Itt lehetne adatbázisba menteni, most csak ellenőrzés
    if (!username || !email || !password) {
        return res.json({ success: false, message: 'Minden mező kitöltése kötelező!' });
    }
    // Sikeres regisztráció (demo)
    return res.json({ success: true, message: 'Sikeres regisztráció!' });
});

app.listen(PORT, () => {
    console.log(`Szerver fut: http://localhost:${PORT}`);
});
