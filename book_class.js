const express = require('express');
const router = express.Router();
const db = require('./db');

router.get('/book_class', (req, res) => {
  const html = `
    <h1>Book User into Class</h1>
    <form method="POST" action="/book_class">
      <label>User ID: <input type="number" name="user_id" required></label><br>
      <label>Class ID: <input type="number" name="class_id" required></label><br>
      <button type="submit">Book</button>
    </form>
  `;
  res.send(html);
});

router.post('/book_class', (req, res) => {
  const { user_id, class_id } = req.body;
  const sql = 'INSERT INTO bookings (user_id, class_id) VALUES (?, ?)';
  db.query(sql, [user_id, class_id], (err) => {
    if (err) throw err;
    res.redirect('/view_classes');
  });
});

module.exports = router;
