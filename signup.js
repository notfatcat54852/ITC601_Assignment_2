const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const db = require('./db');

// Render Signup Page
router.get('/signup', (req, res) => {
  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Signup</title>
      <link rel="stylesheet" href="/styles.css">
    </head>
    <body>
      <div class="content">
        <h1>Signup</h1>
        <form method="POST" action="/signup">
          <label>First Name: <input type="text" name="first_name" required></label><br>
          <label>Last Name: <input type="text" name="last_name" required></label><br>
          <label>Email: <input type="email" name="email" required></label><br>
          <label>Password: <input type="password" name="password" required></label><br>
          <label>Role: 
            <select name="role" required>
              <option value="client">Client</option>
              <option value="staff">Staff</option>
              <option value="admin">Admin</option>
            </select>
          </label><br>
          <button type="submit">Signup</button>
        </form>
      </div>
    </body>
    </html>
  `;
  res.send(html);
});

// Handle Signup Form Submission
router.post('/signup', async (req, res) => {
  const { first_name, last_name, email, password, role } = req.body;
  
  // Hash the password
  const hashedPassword = await bcrypt.hash(password, 10);

  const sql = `
    INSERT INTO users (first_name, last_name, email, password, role)
    VALUES (?, ?, ?, ?, ?)
  `;

  db.query(sql, [first_name, last_name, email, hashedPassword, role], (err) => {
    if (err) throw err;
    res.redirect('/login');
  });
});

module.exports = router;
