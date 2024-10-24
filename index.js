const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const db = require('./db');

const app = express();
const PORT = 3000;

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'views'))); // Serve HTML files

// ---------- USERS ----------

// Route to View All Users
app.get('/view_users', (req, res) => {
  const sql = 'SELECT * FROM users';
  db.query(sql, (err, results) => {
    if (err) throw err;

    let html = `<h1>Users List</h1><a href="index.html">Back to Home</a><br><br>`;
    html += `<table border="1">
              <tr>
                <th>ID</th><th>First Name</th><th>Last Name</th><th>Email</th><th>Role</th><th>Actions</th>
              </tr>`;
    results.forEach(user => {
      html += `<tr>
                 <td>${user.user_id}</td>
                 <td>${user.first_name}</td>
                 <td>${user.last_name}</td>
                 <td>${user.email}</td>
                 <td>${user.role}</td>
                 <td>
                   <a href="/edit_user.html?id=${user.user_id}">Edit</a> |
                   <a href="/delete_user/${user.user_id}">Delete</a>
                 </td>
               </tr>`;
    });
    html += `</table>`;
    res.send(html);
  });
});

// Route to View All Classes with Bookings
app.get('/view_classes', (req, res) => {
  const sql = `
    SELECT 
      classes.class_id, 
      classes.class_name, 
      classes.start_time, 
      classes.end_time, 
      classes.max_capacity, 
      users.first_name AS instructor_name 
    FROM classes 
    LEFT JOIN users ON classes.instructor_id = users.user_id;
  `;

  db.query(sql, (err, classResults) => {
    if (err) throw err;

    let html = `<h1>Classes List</h1><a href="/">Back to Home</a><br><br>`;
    html += `<h1>Users List</h1><a href="index.html">Back to Home</a><br><br>`;
    classResults.forEach((classData) => {
      html += `
        <h3>${classData.class_name} - Instructor: ${classData.instructor_name || 'N/A'}</h3>
        <p>Start: ${classData.start_time} | End: ${classData.end_time}</p>
        <p>Max Capacity: ${classData.max_capacity}</p>
        <h4>Bookings:</h4>
      `;

      const bookingsSql = `
        SELECT users.first_name, users.last_name 
        FROM bookings 
        JOIN users ON bookings.client_id = users.user_id 
        WHERE bookings.class_id = ?;
      `;

      db.query(bookingsSql, [classData.class_id], (err, bookings) => {
        if (err) throw err;

        if (bookings.length > 0) {
          html += '<ul>';
          bookings.forEach((booking) => {
            html += `<li>${booking.first_name} ${booking.last_name}</li>`;
          });
          html += '</ul>';
        } else {
          html += '<p>No bookings yet.</p>';
        }
      });
    });

    // Add a slight delay to allow all async queries to complete before sending the response
    setTimeout(() => res.send(html), 300);
  });
});



// Add User
app.post('/add_user', (req, res) => {
  const { first_name, last_name, email, password, role } = req.body;
  const sql = 'INSERT INTO users (first_name, last_name, email, password, role) VALUES (?, ?, ?, ?, ?)';
  db.query(sql, [first_name, last_name, email, password, role], (err) => {
    if (err) throw err;
    res.redirect('/');
  });
});

// Serve Edit User Form
app.get('/edit_user.html', (req, res) => {
  const userId = req.query.id;
  const sql = 'SELECT * FROM users WHERE user_id = ?';
  db.query(sql, [userId], (err, result) => {
    if (err) throw err;
    const user = result[0];
    res.send(`
      <h1>Edit User</h1>
      <form method="POST" action="/update_user/${user.user_id}">
        <label>First Name: <input type="text" name="first_name" value="${user.first_name}" required></label><br>
        <label>Last Name: <input type="text" name="last_name" value="${user.last_name}" required></label><br>
        <label>Email: <input type="email" name="email" value="${user.email}" required></label><br>
        <label>Password: <input type="password" name="password" required></label><br>
        <label>Role:
          <select name="role" required>
            <option value="client" ${user.role === 'client' ? 'selected' : ''}>Client</option>
            <option value="staff" ${user.role === 'staff' ? 'selected' : ''}>Staff</option>
            <option value="admin" ${user.role === 'admin' ? 'selected' : ''}>Admin</option>
          </select>
        </label><br>
        <button type="submit">Update User</button>
      </form>
    `);
  });
});

// Update User
app.post('/update_user/:id', (req, res) => {
  const { first_name, last_name, email, password, role } = req.body;
  const sql = 'UPDATE users SET first_name = ?, last_name = ?, email = ?, password = ?, role = ? WHERE user_id = ?';
  db.query(sql, [first_name, last_name, email, password, role, req.params.id], (err) => {
    if (err) throw err;
    res.redirect('/');
  });
});

// Delete User
app.get('/delete_user/:id', (req, res) => {
  const sql = 'DELETE FROM users WHERE user_id = ?';
  db.query(sql, [req.params.id], (err) => {
    if (err) throw err;
    res.redirect('/');
  });
});

// ---------- CLASSES ----------

// Serve Add Class Form
app.get('/add_class.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'add_class.html'));
});

// Add Class
app.post('/add_class', (req, res) => {
  const { class_name, start_time, end_time, instructor_id, max_capacity } = req.body;
  const sql = 'INSERT INTO classes (class_name, start_time, end_time, instructor_id, max_capacity) VALUES (?, ?, ?, ?, ?)';
  db.query(sql, [class_name, start_time, end_time, instructor_id, max_capacity], (err) => {
    if (err) throw err;
    res.redirect('/');
  });
});

// Serve Edit Class Form
app.get('/edit_class.html', (req, res) => {
  const classId = req.query.id;
  const sql = 'SELECT * FROM classes WHERE class_id = ?';
  db.query(sql, [classId], (err, result) => {
    if (err) throw err;
    const classData = result[0];
    res.send(`
      <h1>Edit Class</h1>
      <form method="POST" action="/update_class/${classData.class_id}">
        <label>Class Name: <input type="text" name="class_name" value="${classData.class_name}" required></label><br>
        <label>Start Time: <input type="datetime-local" name="start_time" value="${classData.start_time}" required></label><br>
        <label>End Time: <input type="datetime-local" name="end_time" value="${classData.end_time}" required></label><br>
        <label>Instructor ID: <input type="number" name="instructor_id" value="${classData.instructor_id}" required></label><br>
        <label>Max Capacity: <input type="number" name="max_capacity" value="${classData.max_capacity}" required></label><br>
        <button type="submit">Update Class</button>
      </form>
    `);
  });
});

// Update Class
app.post('/update_class/:id', (req, res) => {
  const { class_name, start_time, end_time, instructor_id, max_capacity } = req.body;
  const sql = 'UPDATE classes SET class_name = ?, start_time = ?, end_time = ?, instructor_id = ?, max_capacity = ? WHERE class_id = ?';
  db.query(sql, [class_name, start_time, end_time, instructor_id, max_capacity, req.params.id], (err) => {
    if (err) throw err;
    res.redirect('/');
  });
});

// ---------- BOOKINGS ----------

// Serve Book Class Form
app.get('/book_class.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'book_class.html'));
});

// Book User into Class
app.post('/book_class', (req, res) => {
  const { client_id, class_id } = req.body;
  const sql = 'INSERT INTO bookings (client_id, class_id) VALUES (?, ?)';
  db.query(sql, [client_id, class_id], (err) => {
    if (err) throw err;
    res.send('<h1>Booking Successful!</h1><a href="/">Back to Home</a>');
  });
});

// Start the server
app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));
