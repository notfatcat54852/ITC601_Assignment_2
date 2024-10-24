const express = require('express');
const router = express.Router();
const db = require('./db');

// Add Class Form with Instructor Dropdown
router.get('/add_class', (req, res) => {
  // Query to get all instructors
  const sql = `SELECT user_id, CONCAT(first_name, ' ', last_name) AS full_name FROM users WHERE role = 'staff'`;

  db.query(sql, (err, results) => {
    if (err) throw err;

    // Generate the instructor dropdown options
    let instructorOptions = ``;
    results.forEach(instructor => {
      instructorOptions += `<option value="${instructor.user_id}">${instructor.full_name}</option>`;
    });

    // HTML Form with Instructor Dropdown
    const html = `
      <h1>Add New Class</h1>
      <form method="POST" action="/add_class">
        <label>Class Name: <input type="text" name="class_name"></label><br>
        <label>Start Time: <input type="datetime-local" name="start_time" required></label><br>
        <label>End Time: <input type="datetime-local" name="end_time"></label><br>
        <label>Instructor: 
          <select name="instructor_id">${instructorOptions}</select>
        </label><br>
        <label>Max Capacity: <input type="number" name="max_capacity"></label><br>
        <button type="submit">Add Class</button>
      </form>
    `;
    res.send(html);
  });
});

// Add Class Logic
router.post('/add_class', (req, res) => {
  const {
    class_name = null,
    start_time,
    end_time = null,
    instructor_id,
    max_capacity = 0
  } = req.body;

  const instructorValue = instructor_id ? instructor_id : null;

  const sql = `
    INSERT INTO classes (class_name, start_time, end_time, instructor_id, max_capacity)
    VALUES (?, ?, ?, ?, ?)
  `;

  db.query(sql, [class_name, start_time, end_time, instructorValue, max_capacity], (err) => {
    if (err) throw err;
    res.redirect('/view_classes');
  });
});

module.exports = router;
