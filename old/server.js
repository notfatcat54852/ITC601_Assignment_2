const express = require('express');
const path = require('path');
const mysql = require('mysql2');
const bcrypt = require('bcryptjs');
const session = require('express-session');

const app = express();
app.use(express.json()); // Use JSON parsing middleware

// Serve static files from the 'public' folder
app.use(express.static(path.join(__dirname, 'public')));

// Configure session middleware
app.use(
    session({
        secret: 'your-secret-key',
        resave: false,
        saveUninitialized: false,
        cookie: { secure: false }
    })
);

// Create a MySQL connection
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'projectmgmt'
});

connection.connect(err => {
    if (err) throw err;
    console.log('Connected to MySQL!');
});

// Redirect '/' to 'login.html'
app.get('/', (req, res) => {
    res.redirect('/login.html');
});

// Middleware to check if user is admin or staff
function requireStaffOrAdmin(req, res, next) {
    if (req.session.user && (req.session.user.role === 'admin' || req.session.user.role === 'staff')) {
        next();
    } else {
        res.status(403).send('Access denied');
    }
}

// Admin/Staff User Creation Endpoint
app.post('/create-user', requireStaffOrAdmin, async (req, res) => {
    const { first_name, last_name, email, password, role } = req.body;

    if (!first_name || !last_name || !email || !password || !role) {
        return res.status(400).send('All fields are required');
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const query = `INSERT INTO users (first_name, last_name, email, password, role) VALUES (?, ?, ?, ?, ?)`;

        connection.query(query, [first_name, last_name, email, hashedPassword, role], (err, results) => {
            if (err) {
                console.error('Error creating user:', err);
                return res.status(500).send('Error creating user');
            }
            res.status(201).send('User created successfully');
        });
    } catch (error) {
        console.error('Error in creation logic:', error);
        res.status(500).send('Error creating user');
    }
});

// Login Endpoint
app.post('/login', (req, res) => {
    const { email, password } = req.body;

    const query = 'SELECT * FROM users WHERE email = ?';
    connection.query(query, [email], async (err, results) => {
        if (err) return res.status(500).send('Error logging in');
        if (results.length === 0) return res.status(401).send('Invalid credentials');

        const user = results[0];
        const match = await bcrypt.compare(password, user.password);

        if (match) {
            req.session.user = { id: user.user_id, role: user.role };
            if (user.role === 'admin' || user.role === 'staff') {
                return res.redirect('/dashboard.html');
            } else {
                res.status(403).send('Access denied');
            }
        } else {
            res.status(401).send('Invalid credentials');
        }
    });
});

// Logout Endpoint
app.post('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) return res.status(500).send('Logout failed');
        res.send('Logged out successfully');
    });
});

// Start the server
const server = app.listen(3000, () => {
    console.log(`Server running on port ${server.address().port}`);
});

app.post('/register', async (req, res) => {
    const { first_name, last_name, email, password } = req.body;

    if (!first_name || !last_name || !email || !password) {
        return res.status(400).send('All fields are required');
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const query = `
            INSERT INTO users (first_name, last_name, email, password, role) 
            VALUES (?, ?, ?, ?, 'client')
        `;

        connection.query(query, [first_name, last_name, email, hashedPassword], (err, results) => {
            if (err) {
                console.error('Error registering user:', err);
                return res.status(500).send('Error registering user. Email may already be in use.');
            }
            res.status(201).send('Signup successful! You can now log in.');
        });
    } catch (error) {
        console.error('Error in registration logic:', error);
        res.status(500).send('Error during signup. Please try again.');
    }
});



// const express = require('express');
// const mysql = require('mysql2');
// const bcrypt = require('bcryptjs');
// const bodyParser = require('body-parser');
// const path = require('path');

// const app = express();
// app.use(bodyParser.json());

// // Serve static files
// app.use(express.static(path.join(__dirname, 'public')));

// // Create a MySQL connection
// const connection = mysql.createConnection({
//     host: 'localhost',
//     user: 'root',      // Update with your MySQL username if different
//     password: '',      // Update with your MySQL password if set
//     database: 'projectmgmt' // Use the newly created database
// });

// connection.connect(err => {
//     if (err) {
//         console.error('Error connecting to MySQL:', err);
//         process.exit(1); // Exit the application if the connection fails
//     }
//     console.log('Connected to MySQL!');
// });

// // Register endpoint
// app.post('/register', async (req, res) => {
//     const { username, password } = req.body;

//     if (!username || !password) {
//         return res.status(400).send('Username and password are required');
//     }

//     const hashedPassword = await bcrypt.hash(password, 10);

//     const query = 'INSERT INTO users (username, password) VALUES (?, ?)';
//     connection.query(query, [username, hashedPassword], (err, results) => {
//         if (err) return res.status(500).send('Error registering user');
//         res.status(201).send('User registered');
//     });
// });

// // Login endpoint
// app.post('/login', (req, res) => {
//     const { username, password } = req.body;

//     if (!username || !password) {
//         return res.status(400).send('Username and password are required');
//     }

//     const query = 'SELECT password FROM users WHERE username = ?';
//     connection.query(query, [username], async (err, results) => {
//         if (err) return res.status(500).send('Error logging in');
//         if (results.length === 0) return res.status(401).send('Invalid credentials');

//         const hashedPassword = results[0].password;
//         const match = await bcrypt.compare(password, hashedPassword);

//         if (match) {
//             res.send('Login successful');
//         } else {
//             res.status(401).send('Invalid credentials');
//         }
//     });
// });

// // Start the server
// const server = app.listen(3000, () => {
//     console.log(`Server running on port ${server.address().port}`);
// });

/////////////////////////////////////////


// const express = require('express');
// const mysql = require('mysql2');
// const bcrypt = require('bcryptjs');
// const bodyParser = require('body-parser');
// const path = require('path');

// const app = express();
// app.use(bodyParser.json());

// // Serve static files
// app.use(express.static(path.join(__dirname, 'public')));

// // Create a MySQL connection
// const connection = mysql.createConnection({
//     host: 'localhost',
//     user: 'root',
//     password: '',
//     database: 'login_system'
// });

// connection.connect(err => {
//     if (err) throw err;
//     console.log('Connected to MySQL!');
// });

// // Register endpoint
// app.post('/register', async (req, res) => {
//     const { username, password } = req.body;

//     if (!username || !password) {
//         return res.status(400).send('Username and password are required');
//     }

//     const hashedPassword = await bcrypt.hash(password, 10);

//     const query = 'INSERT INTO users (username, password) VALUES (?, ?)';
//     connection.query(query, [username, hashedPassword], (err, results) => {
//         if (err) return res.status(500).send('Error registering user');
//         res.status(201).send('User registered');
//     });
// });

// // Login endpoint
// app.post('/login', (req, res) => {
//     const { username, password } = req.body;

//     if (!username || !password) {
//         return res.status(400).send('Username and password are required');
//     }

//     const query = 'SELECT password FROM users WHERE username = ?';
//     connection.query(query, [username], async (err, results) => {
//         if (err) return res.status(500).send('Error logging in');
//         if (results.length === 0) return res.status(401).send('Invalid credentials');

//         const hashedPassword = results[0].password;
//         const match = await bcrypt.compare(password, hashedPassword);

//         if (match) {
//             res.send('Login successful');
//         } else {
//             res.status(401).send('Invalid credentials');
//         }
//     });
// });

// // // Start the server
// // app.listen(8000, () => {
// //     console.log('Server running on port 8000');
// // });
// // Start the server
// const server = app.listen(3000, () => {
//     console.log(`Server running on port ${server.address().port}`);
// });
