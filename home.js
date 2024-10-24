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
          <li><a href="/users">Users</a></li>
          <li><a href="/classes">Classes</a></li>
        </ul>
      </nav>
    `;
    res.send(html);
  });
  
  module.exports = router;