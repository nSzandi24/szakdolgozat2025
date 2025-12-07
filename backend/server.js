const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const path = require('path');
const registrationService = require('./services/registration');
const authService = require('./services/auth');
const storyService = require('./services/storyService');
const { generateToken, authMiddleware } = require('./middleware/authMiddleware');

const storyRoutes = require('./routes/storyRoutes');
const gameRoutes = require('./routes/gameRoutes');

const app = express();
const PORT = 3000;

app.use(bodyParser.json());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, '../frontend/public')));

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend/public/index.html"));
});

app.post("/register", async (req, res) => {
    try {
        const result = await registrationService.register(req.body);
        
        if (result.success && result.user) {
            const token = generateToken(result.user);
            
            res.cookie('token', token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production', 
                sameSite: 'strict',
                maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
            });
        }
        
        res.json(result);
    } catch (err) {
        console.error('Registration error:', err);
        res.status(500).json({ success: false, message: 'Szerverhiba a regisztráció során.' });
    }
});

app.post('/login', async (req, res) => {
    try {
        const result = await authService.login(req.body);
        
        if (result.success && result.user) {
            const token = generateToken(result.user);
            
            res.cookie('token', token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
            });
        }
        
        res.json(result);
    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ success: false, message: 'Szerverhiba a bejelentkezés során.' });
    }
});

app.post('/logout', (req, res) => {
    res.clearCookie('token');
    res.json({ success: true, message: 'Sikeres kijelentkezés.' });
});

app.use('/api/story', authMiddleware, storyRoutes);
app.use('/api/game', authMiddleware, gameRoutes);

const { sequelize } = require('./database');

(async () => {
    try {
        console.log('Connecting to database...');
        await sequelize.sync();
        console.log('Database connected.');
        
        console.log('Loading story content...');
        await storyService.initialize();
        console.log('Story content loaded.');
        
        app.listen(PORT, () => {
            console.log(`Szerver fut: http://localhost:${PORT}`);
        });
    } catch (err) {
        console.error('Unable to start server:', err);
        process.exit(1);
    }
})();
