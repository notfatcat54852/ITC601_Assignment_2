const express = require('express');
const mysql = require('mysql2');
const bcrypt = require('bcryptjs');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
app.use(bodyParser.json());

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Create a MySQL connection
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'login_system'
});

connection.connect(err => {
    if (err) throw err;
    console.log('Connected to MySQL!');
});

// Register endpoint
app.post('/register', async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).send('Username and password are required');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const query = 'INSERT INTO users (username, password) VALUES (?, ?)';
    connection.query(query, [username, hashedPassword], (err, results) => {
        if (err) return res.status(500).send('Error registering user');
        res.status(201).send('User registered');
    });
});

// Login endpoint
app.post('/login', (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).send('Username and password are required');
    }

    const query = 'SELECT password FROM users WHERE username = ?';
    connection.query(query, [username], async (err, results) => {
        if (err) return res.status(500).send('Error logging in');
        if (results.length === 0) return res.status(401).send('Invalid credentials');

        const hashedPassword = results[0].password;
        const match = await bcrypt.compare(password, hashedPassword);

        if (match) {
            res.send('Login successful');
        } else {
            res.status(401).send('Invalid credentials');
        }
    });
});

// // Start the server
// app.listen(8000, () => {
//     console.log('Server running on port 8000');
// });
// Start the server
const server = app.listen(8000, () => {
    console.log(`Server running on port ${server.address().port}`);
});
