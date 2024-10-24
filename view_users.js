const express = require('express');
const router = express.Router();
const db = require('./db');

router.get('/view_users', (req, res) => {
  const sql = 'SELECT * FROM users';
  db.query(sql, (err, results) => {
    if (err) throw err;

    let html = `<h1>Users List</h1><a href="/home">Back to Home</a><br><br>`;
    html += `<table border="1">
              <tr><th>ID</th><th>Name</th><th>Email</th><th>Role</th></tr>`;
    results.forEach(user => {
      html += `<tr>
                 <td>${user.user_id}</td>
                 <td>${user.first_name} ${user.last_name}</td>
                 <td>${user.email}</td>
                 <td>${user.role}</td>
               </tr>`;
    });
    html += `</table>`;
    res.send(html);
  });
});

module.exports = router;
