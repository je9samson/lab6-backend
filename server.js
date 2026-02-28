const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
require('dotenv').config();

const app = express();

// 1. CORS CONFIGURATION
app.use(cors({
    origin: 'https://je9samson.github.io',
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// LOGGING MIDDLEWARE: This will show every request in your Render Logs
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} request to ${req.url}`);
    next();
});

// 2. DATABASE CONNECTION
const db = mysql.createPool({
    host: process.env.DB_HOST,      
    port: process.env.DB_PORT,      
    user: process.env.DB_USER,      
    password: process.env.DB_PASSWORD, 
    database: process.env.DB_NAME,  
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Test connection
db.getConnection((err, connection) => {
    if (err) {
        console.error("❌ Database connection failed:", err.message);
    } else {
        console.log("✅ Connected to Railway MySQL via Public Proxy!");
        connection.release();
    }
});

// 3. ROUTES
// Root route - This MUST work for the 404 to go away
app.get('/', (req, res) => {
    res.status(200).send("Backend is Live and Connected!");
});

// Mood route
app.post('/moods', (req, res) => {
    const { mood_type } = req.body;
    console.log("📥 Received mood data:", mood_type);

    if (!mood_type) {
        return res.status(400).json({ error: "Mood type is required" });
    }

    const query = 'INSERT INTO moods (mood_type) VALUES (?)';
    db.query(query, [mood_type], (err, result) => {
        if (err) {
            console.error("❌ SQL Error during insertion:", err);
            return res.status(500).json({ error: "Database error" });
        }
        console.log("🚀 Mood saved! ID:", result.insertId);
        res.status(201).json({ message: "Mood saved!", id: result.insertId });
    });
});

// 4. START SERVER
const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server is running on port ${PORT}`);
});