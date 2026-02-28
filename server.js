const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
require('dotenv').config();

const app = express();

app.use(cors({
    origin: 'https://je9samson.github.io',
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
}));

app.use(express.json());

// DATABASE POOL with specific Timeout for Railway
const db = mysql.createPool({
    host: process.env.DB_HOST,      
    port: process.env.DB_PORT,      
    user: process.env.DB_USER,      
    password: process.env.DB_PASSWORD, 
    database: process.env.DB_NAME,  
    waitForConnections: true,
    connectionLimit: 10,
    connectTimeout: 15000 // Give it 15 seconds to find Railway
});

// THIS IS THE LOG YOU ARE LOOKING FOR
db.getConnection((err, connection) => {
    if (err) {
        console.error("❌ DATABASE CONNECTION FAILED:", err.message);
        console.error("Check if DB_PORT is 55455 and DB_HOST is caboose.proxy.rlwy.net");
    } else {
        console.log("✅ SUCCESS: Connected to Railway MySQL!");
        connection.release();
    }
});

app.get('/', (req, res) => res.send("Backend is Live! Waiting for DB..."));

app.post('/moods', (req, res) => {
    const { mood_type } = req.body;
    db.query('INSERT INTO moods (mood_type) VALUES (?)', [mood_type], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.status(201).json({ message: "Saved!" });
    });
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, '0.0.0.0', () => console.log(`🚀 Server on port ${PORT}`));