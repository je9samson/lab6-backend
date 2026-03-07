const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
require('dotenv').config();

const app = express();

app.use(cors({
    origin: '*', // No trailing slash here either!
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

const db = mysql.createPool({
    host: process.env.DB_HOST,      
    port: process.env.DB_PORT,      
    user: process.env.DB_USER,      
    password: process.env.DB_PASSWORD, 
    database: process.env.DB_NAME,  
    waitForConnections: true,
    connectionLimit: 10,
    connectTimeout: 15000 
});

db.getConnection((err, connection) => {
    if (err) {
        console.error("❌ DATABASE CONNECTION FAILED:", err.message);
    } else {
        console.log("✅ SUCCESS: Connected to Railway MySQL!");
        connection.release();
    }
});

app.get('/', (req, res) => res.send("Backend is Live!"));

// --- FIXED POST ROUTE ---
// REPLACE your current /moods routes with these:

// Replace your existing /moods routes with these
app.post('/moods', (req, res) => {
    const { full_name, mood_text } = req.body; 

    db.query(
        'INSERT INTO moods (full_name, mood_text) VALUES (?, ?)', 
        [full_name, mood_text], 
        (err) => {
            if (err) return res.status(500).json({ error: err.message });
            
            // This aiMessage stops the loading spinner on your website
            res.status(201).json({ 
                message: "Saved!", 
                aiMessage: "I've noted your mood. Take a deep breath and stay mindful! 🌿" 
            });
        }
    );
});

app.get('/moods', (req, res) => {
    db.query('SELECT * FROM moods ORDER BY created_at DESC', (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});
const PORT = process.env.PORT || 10000;
app.listen(PORT, '0.0.0.0', () => console.log(`🚀 Server on port ${PORT}`));