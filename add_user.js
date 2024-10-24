const express = require('express');
const router = express.Router();
const db = require('./db');

router.get('/add_user', (req, res) => {
  const html = `
    <h1>Add New User</h1>
    <form method="POST" action="/add_user">
      <label>First Name: <input type="text" name="first_name" required></label><br>
      <label>Last Name: <input type="text" name="last_name" required></label><br>
      <label>Email: <input type="email" name="email" required></label><br>
      <label>Password: <input type="password" name="password" required></label><br>
      <button type="submit">Add User</button>
    </form>
  `;
  res.send(html);
});

router.post('/add_user', (req, res) => {
  const { first_name, last_name, email, password } = req.body;
  const sql = 'INSERT INTO users (first_name, last_name, email, password) VALUES (?, ?, ?, ?)';
  db.query(sql, [first_name, last_name, email, password], (err) => {
    if (err) throw err;
    res.redirect('/view_users');
  });
});

module.exports = router;
