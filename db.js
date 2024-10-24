const mysql = require('mysql2');

// Create connection to the database
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',     // Replace with your MySQL username
  password: '',     // Replace with your MySQL password
  database: 'gym_management'
});

// Connect to the database
db.connect((err) => {
  if (err) throw err;
  console.log('Connected to MySQL Database.');
});

module.exports = db;
