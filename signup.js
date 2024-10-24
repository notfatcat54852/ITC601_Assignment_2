const express = require('express');
const router = express.Router();

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
      <div class="centered-container">
        <form method="POST" action="/signup">
          <h1>Signup</h1>
          <label>First Name:</label>
          <input type="text" name="first_name" required>
          <label>Last Name:</label>
          <input type="text" name="last_name" required>
          <label>Email:</label>
          <input type="email" name="email" required>
          <label>Password:</label>
          <input type="password" name="password" required>
          <label>Role:</label>
          <select name="role" required>
            <option value="client">Client</option>
            <option value="staff">Staff</option>
            <option value="admin">Admin</option>
          </select>
          <button type="submit">Signup</button>
        </form>
      </div>
    </body>
    </html>
  `;
  res.send(html);
});

module.exports = router;
