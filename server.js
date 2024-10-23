const express = require('express');
const session = require('express-session');
const mysql = require('mysql2');
const bcrypt = require('bcryptjs');
const path = require('path');

const app = express();

// Middleware setup
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: false
}));

// MySQL connection setup
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'projectmgmt'
});

db.connect(err => {
    if (err) throw err;
    console.log('Connected to MySQL database.');
});

// Signup route (for client role only)
app.post('/signup', async (req, res) => {
    const { first_name, last_name, email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    const query = `INSERT INTO users (first_name, last_name, email, password, role) VALUES (?, ?, ?, ?, 'client')`;
    db.query(query, [first_name, last_name, email, hashedPassword], (err) => {
        if (err) return res.status(500).send('Error creating account.');
        res.status(201).send('Signup successful!');
    });
});

// Login route
app.post('/login', (req, res) => {
    const { email, password } = req.body;
    const query = 'SELECT * FROM users WHERE email = ?';

    db.query(query, [email], async (err, results) => {
        if (err) return res.status(500).send('Login error.');

        if (results.length === 0) return res.status(401).send('Invalid credentials.');

        const user = results[0];
        const match = await bcrypt.compare(password, user.password);

        if (match) {
            req.session.user = { id: user.user_id, role: user.role };
            return res.send(user.role);
        } else {
            res.status(401).send('Invalid credentials.');
        }
    });
});

// Logout route
app.get('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            return res.status(500).send('Error logging out.');
        }
        res.redirect('/login.html'); // Redirect to the login page after logging out
    });
});

// Dashboard routes
app.get('/admin-dashboard', (req, res) => {
    if (req.session.user?.role === 'admin') {
        res.sendFile(path.join(__dirname, 'public/admin-dashboard.html'));
    } else {
        res.status(403).send('Access denied.');
    }
});

app.get('/staff-dashboard', (req, res) => {
    if (req.session.user?.role === 'staff') {
        res.sendFile(path.join(__dirname, 'public/staff-dashboard.html'));
    } else {
        res.status(403).send('Access denied.');
    }
});

app.get('/client-dashboard', (req, res) => {
    if (req.session.user?.role === 'client') {
        res.sendFile(path.join(__dirname, 'public/client-dashboard.html'));
    } else {
        res.status(403).send('Access denied.');
    }
});

// Default route: Redirect to login
app.get('/', (req, res) => {
    res.redirect('/login.html');
});

// Start the server
const PORT = 3000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
