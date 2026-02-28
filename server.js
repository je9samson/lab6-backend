const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
require('dotenv').config();

const app = express();

// 1. CORS CONFIGURATION: Explicitly allow your GitHub frontend
app.use(cors({
    origin: 'https://je9samson.github.io',
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type']
}));

app.use(express.json());

// 2. DATABASE CONNECTION: Using the Public Proxy from your screenshot
const db = mysql.createPool({
    host: process.env.DB_HOST,      // caboose.proxy.rlwy.net
    port: process.env.DB_PORT,      // 55455
    user: process.env.DB_USER,      // root
    password: process.env.DB_PASSWORD, 
    database: process.env.DB_NAME,  // railway
    waitForConnections: true,
    connectionLimit: 10
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

// 3. MOOD ROUTE: Endpoint to save mood data
app.post('/moods', (req, res) => {
    const { mood_type } = req.body;
    if (!mood_type) return res.status(400).json({ error: "Mood type is required" });

    const query = 'INSERT INTO moods (mood_type) VALUES (?)';
    db.query(query, [mood_type], (err, result) => {
        if (err) {
            console.error("❌ SQL Error:", err);
            return res.status(500).json({ error: "Database error" });
        }
        res.status(201).json({ message: "Mood saved!", id: result.insertId });
    });
});

app.get('/', (req, res) => res.send("Backend is Live and Connected!"));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server on port ${PORT}`));