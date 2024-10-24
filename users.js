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
      <div class="sidebar">
        <h2>Admin Dashboard</h2>
        <a href="/users">Manage Users</a>
        <a href="/classes">Manage Classes</a>
        <a href="/home">Home</a>
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

    html += `</table></div>`;
    res.send(html);
  });
});

// Serve Edit User Form
router.get('/edit_user/:id', (req, res) => {
  const userId = req.params.id;

  const sql = 'SELECT * FROM users WHERE user_id = ?';
  db.query(sql, [userId], (err, result) => {
    if (err) throw err;
    const user = result[0];

    const html = `
      <div class="sidebar">
        <h2>Admin Dashboard</h2>
        <a href="/users">Manage Users</a>
        <a href="/classes">Manage Classes</a>
        <a href="/home">Home</a>
        <a href="/logout">Logout</a>
      </div>

      <div class="content">
        <h1>Edit User</h1>
        <form method="POST" action="/update_user/${user.user_id}">
          <label>First Name: <input type="text" name="first_name" value="${user.first_name}" required></label><br>
          <label>Last Name: <input type="text" name="last_name" value="${user.last_name}" required></label><br>
          <label>Email: <input type="email" name="email" value="${user.email}" required></label><br>
          <label>Password: <input type="password" name="password" required></label><br>
          <label>Role:
            <select name="role" required>
              <option value="admin" ${user.role === 'admin' ? 'selected' : ''}>Admin</option>
              <option value="staff" ${user.role === 'staff' ? 'selected' : ''}>Staff</option>
              <option value="client" ${user.role === 'client' ? 'selected' : ''}>Client</option>
            </select>
          </label><br>
          <button type="submit">Update User</button>
        </form>
      </div>
    `;
    res.send(html);
  });
});

// Update User Logic
router.post('/update_user/:id', (req, res) => {
  const { first_name, last_name, email, password, role } = req.body;
  const sql = `
    UPDATE users 
    SET first_name = ?, last_name = ?, email = ?, password = ?, role = ? 
    WHERE user_id = ?
  `;

  db.query(sql, [first_name, last_name, email, password, role, req.params.id], (err) => {
    if (err) throw err;
    res.redirect('/users');
  });
});

// Delete User Logic
router.post('/delete_user/:id', (req, res) => {
  const sql = 'DELETE FROM users WHERE user_id = ?';
  db.query(sql, [req.params.id], (err) => {
    if (err) throw err;
    res.redirect('/users');
  });
});

module.exports = router;
