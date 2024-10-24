const express = require('express');
const router = express.Router();
const db = require('./db');

// List Users with Search, Edit, and Delete Options
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
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Manage Users</title>
        <link rel="stylesheet" href="/styles.css">
      </head>
      <body>
        <div class="wrapper">
          <div class="sidebar">
            <h2>Admin Dashboard</h2>
            <a href="/classes">Manage Classes</a>
            <a href="/users">Manage Users</a>

            <a href="/logout">Logout</a>
          </div>

          <div class="content">
            <h1>Manage Users</h1>
            <form method="GET" action="/users">
              <input type="text" name="search" placeholder="Search users" value="${search}">
              <button type="submit">Search</button>
            </form><br>
            <a href="/add_user">Add New User</a>

            <table>
              <tr><th>ID</th><th>Name</th><th>Email</th><th>Role</th><th>Actions</th></tr>
    `;

    results.forEach(user => {
      html += `
        <tr>
          <td>${user.user_id}</td>
          <td>${user.first_name} ${user.last_name}</td>
          <td>${user.email}</td>
          <td>${user.role}</td>
          <td>
            <a href="/edit_user/${user.user_id}"><button>Edit</button></a>
            <form method="POST" action="/delete_user/${user.user_id}" style="display:inline;">
              <button type="submit" onclick="return confirm('Are you sure you want to delete this user?');">Delete</button>
            </form>
          </td>
        </tr>
      `;
    });

    html += `</table></div></div></body></html>`;
    res.send(html);
  });
});

module.exports = router;
