const express = require('express');
const router = express.Router();

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
      <div class="centered-container">
        <form method="POST" action="/login">
          <h1>Login</h1>
          <label>Email:</label>
          <input type="email" name="email" required>
          <label>Password:</label>
          <input type="password" name="password" required>
          <button type="submit">Login</button>
        </form>
      </div>
    </body>
    </html>
  `;
  res.send(html);
});

module.exports = router;
