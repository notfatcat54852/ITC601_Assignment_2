const express = require('express');
const router = express.Router();
const db = require('./db');

// List Classes with Date Filter, Edit, Delete, and View Bookings Options
router.get('/classes', (req, res) => {
  const today = new Date().toISOString().slice(0, 10);
  const oneMonthFromNow = new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString().slice(0, 10);

  const { start_date = today, end_date = oneMonthFromNow } = req.query;

  const sql = `
    SELECT 
      classes.class_id, classes.class_name, classes.start_time, classes.end_time, 
      classes.max_capacity, users.first_name AS instructor_name,
      (SELECT COUNT(*) FROM bookings WHERE bookings.class_id = classes.class_id) AS num_bookees
    FROM classes
    LEFT JOIN users ON classes.instructor_id = users.user_id
    WHERE DATE(classes.start_time) BETWEEN ? AND ?
    ORDER BY classes.start_time ASC;
  `;

  db.query(sql, [start_date, end_date], (err, results) => {
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
        <h1>Manage Classes</h1>
        <form method="GET" action="/classes">
          <label>Start Date: <input type="date" name="start_date" value="${start_date}"></label>
          <label>End Date: <input type="date" name="end_date" value="${end_date}"></label>
          <button type="submit">Filter</button>
        </form><br>
        <a href="/add_class">Add New Class</a>

        <table>
          <tr>
            <th>ID</th><th>Name</th><th>Instructor</th><th>Start</th><th>End</th><th>Bookings</th><th>Actions</th>
          </tr>
    `;

    results.forEach(cls => {
      html += `
        <tr>
          <td>${cls.class_id}</td>
          <td>${cls.class_name}</td>
          <td>${cls.instructor_name || 'N/A'}</td>
          <td>${cls.start_time}</td>
          <td>${cls.end_time}</td>
          <td>${cls.num_bookees}</td>
          <td>
            <a href="/edit_class/${cls.class_id}"><button>Edit</button></a>
            <a href="/view_bookings/${cls.class_id}"><button>View Bookings</button></a>
            <form method="POST" action="/delete_class/${cls.class_id}" style="display:inline;">
              <button type="submit" onclick="return confirm('Are you sure you want to delete this class?');">Delete</button>
            </form>
          </td>
        </tr>
      `;
    });

    html += `</table></div>`;
    res.send(html);
  });
});

// View Bookings for a Specific Class
router.get('/view_bookings/:class_id', (req, res) => {
  const { class_id } = req.params;

  const sql = `
    SELECT users.first_name, users.last_name
    FROM bookings
    JOIN users ON bookings.client_id = users.user_id
    WHERE bookings.class_id = ?;
  `;

  db.query(sql, [class_id], (err, results) => {
    if (err) throw err;

    let html = `<h1>Bookings for Class ID: ${class_id}</h1><a href="/classes">Back to Classes</a><br><br>`;
    if (results.length > 0) {
      html += '<ul>';
      results.forEach(user => {
        html += `<li>${user.first_name} ${user.last_name}</li>`;
      });
      html += '</ul>';
    } else {
      html += `<p>No bookings found for this class.</p>`;
    }

    res.send(html);
  });
});

// Delete Class Logic
router.post('/delete_class/:id', (req, res) => {
  const sql = 'DELETE FROM classes WHERE class_id = ?';
  db.query(sql, [req.params.id], (err) => {
    if (err) throw err;
    res.redirect('/classes');
  });
});

module.exports = router;
