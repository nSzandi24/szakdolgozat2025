const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const path = require('path');
const registrationService = require('./services/registration');
const authService = require('./services/auth');
const storyService = require('./services/storyService');
const { generateToken } = require('./middleware/authMiddleware');

// Import routes
const storyRoutes = require('./routes/storyRoutes');
const gameRoutes = require('./routes/gameRoutes');

const app = express();
const PORT = 3000;

// Middleware
app.use(bodyParser.json());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, '../frontend/public')));

// Serve frontend
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend/public/index.html"));
});

// Registration endpoint
app.post("/register", async (req, res) => {
    try {
        const result = await registrationService.register(req.body);
        
        if (result.success && result.user) {
            // Generate JWT token
            const token = generateToken(result.user);
            
            // Set cookie
            res.cookie('token', token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production', // HTTPS only in production
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

// Login endpoint
app.post('/login', async (req, res) => {
    try {
        const result = await authService.login(req.body);
        
        if (result.success && result.user) {
            // Generate JWT token
            const token = generateToken(result.user);
            
            // Set cookie
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

// Logout endpoint
app.post('/logout', (req, res) => {
    res.clearCookie('token');
    res.json({ success: true, message: 'Sikeres kijelentkezés.' });
});

// API Routes (protected)
app.use('/api/story', storyRoutes);
app.use('/api/game', gameRoutes);

// Database connection and server start
const { sequelize } = require('./database');

(async () => {
    try {
        console.log('Connecting to database...');
        await sequelize.sync();
        console.log('Database connected.');
        
        // Initialize story service
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
