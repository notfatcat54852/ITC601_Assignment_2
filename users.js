const express = require('express');
const router = express.Router();
const db = require('./db');

// Search and display users
router.get('/users', (req, res) => {
  const { search = '' } = req.query;

  const sql = `
    SELECT * FROM users 
    WHERE CONCAT(first_name, ' ', last_name) LIKE ? 
    ORDER BY first_name ASC;
  `;

  db.query(sql, [`%${search}%`], (err, results) => {
    if (err) throw err;

    let html = `
      <h1>Users</h1>
      <form method="GET" action="/users">
        <input type="text" name="search" placeholder="Search users" value="${search}">
        <button type="submit">Search</button>
      </form><br>
      <a href="/add_user">Add New User</a><br><br>
    `;

    results.forEach(user => {
      html += `
        <p>${user.first_name} ${user.last_name} - ${user.email}</p>
        <a href="/edit_user/${user.user_id}">Edit</a>
      `;
    });

    res.send(html);
  });
});

module.exports = router;
