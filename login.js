const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const db = require('./db');
const session = require('express-session');

// Setup session middleware
router.use(
  session({
    secret: 'secret-key', // Replace with a secure key
    resave: false,
    saveUninitialized: false,
  })
);

// Render Login Page
router.get('/login', (req, res) => {
  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Login</title>
      <link rel="stylesheet" href="/styles.css">
    </head>
    <body>
      <div class="content">
        <h1>Login</h1>
        <form method="POST" action="/login">
          <label>Email: <input type="email" name="email" required></label><br>
          <label>Password: <input type="password" name="password" required></label><br>
          <button type="submit">Login</button>
        </form>
      </div>
    </body>
    </html>
  `;
  res.send(html);
});

// Handle Login Form Submission
router.post('/login', (req, res) => {
  const { email, password } = req.body;

  const sql = 'SELECT * FROM users WHERE email = ?';
  db.query(sql, [email], async (err, results) => {
    if (err) throw err;

    if (results.length === 0) {
      return res.send('<p>Invalid email or password. <a href="/login">Try again</a></p>');
    }

    const user = results[0];

    // Compare passwords
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.send('<p>Invalid email or password. <a href="/login">Try again</a></p>');
    }

    // Save user information in session
    req.session.userId = user.user_id;
    req.session.role = user.role;

    res.redirect('/home');
  });
});

// Logout Route
router.get('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) throw err;
    res.redirect('/login');
  });
});

module.exports = router;
