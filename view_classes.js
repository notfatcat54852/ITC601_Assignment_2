const express = require('express');
const router = express.Router();
const db = require('./db');

// View Classes with Date Range Filtering and Ordered by Start Date
router.get('/view_classes', (req, res) => {
  // Default date range: Today to one month from now
  const today = new Date();
  const defaultStartDate = today.toISOString().slice(0, 10); // YYYY-MM-DD
  const defaultEndDate = new Date(today.setMonth(today.getMonth() + 1)).toISOString().slice(0, 10);

  // Get date range from query parameters or use defaults
  const { start_date = defaultStartDate, end_date = defaultEndDate } = req.query;

  // SQL query: Order by the date part of start_time
  const sql = `
    SELECT 
      classes.class_id, classes.class_name, 
      DATE_FORMAT(classes.start_time, '%Y-%m-%d %H:%i') AS start_time,
      DATE_FORMAT(classes.end_time, '%Y-%m-%d %H:%i') AS end_time,
      classes.max_capacity, users.first_name AS instructor_name 
    FROM classes 
    LEFT JOIN users ON classes.instructor_id = users.user_id
    WHERE DATE(classes.start_time) BETWEEN ? AND ?
    ORDER BY DATE(classes.start_time) ASC, TIME(classes.start_time) ASC;
  `;

  db.query(sql, [start_date, end_date], (err, results) => {
    if (err) throw err;

    let html = `
      <h1>Classes from ${start_date} to ${end_date}</h1>
      <a href="/home">Back to Home</a><br><br>
      <form method="GET" action="/view_classes">
        <label>Start Date: <input type="date" name="start_date" value="${start_date}"></label>
        <label>End Date: <input type="date" name="end_date" value="${end_date}"></label>
        <button type="submit">Filter</button>
      </form><br>
    `;

    if (results.length > 0) {
      results.forEach((cls) => {
        html += `
          <h3>${cls.class_name} - Instructor: ${cls.instructor_name || 'N/A'}</h3>
          <p>Start: ${cls.start_time} | End: ${cls.end_time}</p>
          <p>Max Capacity: ${cls.max_capacity}</p>
        `;
      });
    } else {
      html += `<p>No classes found for the selected date range.</p>`;
    }

    res.send(html);
  });
});

module.exports = router;
