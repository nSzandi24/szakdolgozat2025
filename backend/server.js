const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const registrationService = require('./services/registration');
const authService = require('./services/auth');

const app = express();
const PORT = 3000;

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, '../frontend/public')));
app.use('/backend/scripts', express.static(path.join(__dirname, 'scripts')));

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend/public/index.html"));
});


app.post("/register", async (req, res) => {
    try {
        const result = await registrationService.register(req.body);
        res.json(result);
    } catch (err) {
        console.error('Registration error:', err);
        res.status(500).json({ success: false, message: 'Szerverhiba a regisztráció során.' });
    }
});

// Bejelentkezés (email + jelszó)
app.post('/login', async (req, res) => {
    try {
        const result = await authService.login(req.body);
        res.json(result);
    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ success: false, message: 'Szerverhiba a bejelentkezés során.' });
    }
});


const { sequelize } = require('./database');

(async () => {
    try {
        console.log('DB connected.');
        await sequelize.sync();
        app.listen(PORT, () => {
            console.log(`Szerver fut: http://localhost:${PORT}`);
        });
    } catch (err) {
        console.error('Unable to start server:', err);
        process.exit(1);
    }
})();
