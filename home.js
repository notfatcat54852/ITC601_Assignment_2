const express = require('express');
const router = express.Router();

// Redirect / to /home
router.get('/', (req, res) => {
    res.redirect('/home');
  });
  

router.get('/home', (req, res) => {
  const html = `
    <h1>Welcome to Gym Management System</h1>
    <nav>
      <ul>
        <li><a href="/view_users">View All Users</a></li>
        <li><a href="/view_classes">View All Classes</a></li>
        <li><a href="/add_user">Add User</a></li>
        <li><a href="/add_class">Add Class</a></li>
        <li><a href="/book_class">Book User into Class</a></li>
      </ul>
    </nav>
  `;
  res.send(html);
});

module.exports = router;
