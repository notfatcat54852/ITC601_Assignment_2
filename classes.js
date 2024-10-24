const express = require('express');
const router = express.Router();
const db = require('./db');

// Get classes with optional date filtering
router.get('/classes', (req, res) => {
  const today = new Date().toISOString().slice(0, 10);
  const oneMonthFromNow = new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString().slice(0, 10);

  const { start_date = today, end_date = oneMonthFromNow } = req.query;

  const sql = `
    SELECT 
      classes.class_id, classes.class_name, classes.start_time, classes.end_time, 
      classes.max_capacity, users.first_name AS instructor_name
    FROM classes
    LEFT JOIN users ON classes.instructor_id = users.user_id
    WHERE DATE(classes.start_time) BETWEEN ? AND ?
    ORDER BY classes.start_time ASC;
  `;

  db.query(sql, [start_date, end_date], (err, results) => {
    if (err) throw err;

    let html = `
      <h1>Classes</h1>
      <form method="GET" action="/classes">
        <label>Start Date: <input type="date" name="start_date" value="${start_date}"></label>
        <label>End Date: <input type="date" name="end_date" value="${end_date}"></label>
        <button type="submit">Filter</button>
      </form><br>
      <a href="/add_class">Add New Class</a><br><br>
    `;

    results.forEach(cls => {
      html += `
        <h3>${cls.class_name} - Instructor: ${cls.instructor_name || 'N/A'}</h3>
        <p>Start: ${cls.start_time} | End: ${cls.end_time}</p>
        <p>Max Capacity: ${cls.max_capacity}</p>
        <a href="/edit_class/${cls.class_id}">Edit</a> | 
        <a href="/view_bookings/${cls.class_id}">View Bookings</a>
      `;
    });

    res.send(html);
  });
});

// View who booked a specific class
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
      html += '<p>No bookings found.</p>';
    }

    res.send(html);
  });
});

module.exports = router;
