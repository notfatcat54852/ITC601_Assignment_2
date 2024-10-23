const express = require('express');
const session = require('express-session');
const mysql = require('mysql2');
const bcrypt = require('bcryptjs');
const path = require('path');

const app = express();

// Middleware setup
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: false
}));

// MySQL connection setup
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'projectmgmt'
});

db.connect(err => {
    if (err) throw err;
    console.log('Connected to MySQL database.');
});

// Signup route (for client role only)
app.post('/signup', async (req, res) => {
    const { first_name, last_name, email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    const query = `INSERT INTO users (first_name, last_name, email, password, role) VALUES (?, ?, ?, ?, 'client')`;
    db.query(query, [first_name, last_name, email, hashedPassword], (err) => {
        if (err) return res.status(500).send('Error creating account.');
        res.status(201).send('Signup successful!');
    });
});

// Login route
// Login route
app.post('/login', (req, res) => {
    const { email, password } = req.body;
    const query = 'SELECT * FROM users WHERE email = ?';

    db.query(query, [email], async (err, results) => {
        if (err) return res.status(500).send('Login error.');

        if (results.length === 0) return res.status(401).send('Invalid credentials.');

        const user = results[0];
        const match = await bcrypt.compare(password, user.password);

        if (match) {
            // Store user's ID, role, and first name in the session
            req.session.user = { 
                id: user.user_id, 
                role: user.role, 
                first_name: user.first_name 
            };
            return res.send(user.role); // Redirects based on role
        } else {
            res.status(401).send('Invalid credentials.');
        }
    });
});


// Dashboard routes
// Admin dashboard route (serving the HTML file)
app.get('/admin-dashboard', (req, res) => {
    if (req.session.user?.role === 'admin') {
        res.sendFile(path.join(__dirname, 'public/admin-dashboard.html'));
    } else {
        res.status(403).send('Access denied.');
    }
});

// Route to send the user's first name to the frontend
app.get('/admin/user-info', (req, res) => {
    if (req.session.user) {
        res.json({ first_name: req.session.user.first_name });
    } else {
        res.status(401).send('Not logged in');
    }
});


app.get('/staff-dashboard', (req, res) => {
    if (req.session.user?.role === 'staff') {
        res.sendFile(path.join(__dirname, 'public/staff-dashboard.html'));
    } else {
        res.status(403).send('Access denied.');
    }
});

app.get('/client-dashboard', (req, res) => {
    if (req.session.user?.role === 'client') {
        res.sendFile(path.join(__dirname, 'public/client-dashboard.html'));
    } else {
        res.status(403).send('Access denied.');
    }
});

// Default route: Redirect to login
app.get('/', (req, res) => {
    res.redirect('/login.html');
});

// View all users (for Manage Users page)
app.get('/admin/manage-users', (req, res) => {
    const query = 'SELECT * FROM users';
    db.query(query, (err, results) => {
        if (err) return res.status(500).send('Error retrieving users.');

        let usersHtml = `
            <h2>Manage Users</h2>
            <table border="1" width="100%" cellpadding="5">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>First Name</th>
                        <th>Last Name</th>
                        <th>Email</th>
                        <th>Role</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
        `;

        results.forEach(user => {
            usersHtml += `
                <tr>
                    <td>${user.user_id}</td>
                    <td>${user.first_name}</td>
                    <td>${user.last_name}</td>
                    <td>${user.email}</td>
                    <td>${user.role}</td>
                    <td>
                        <button onclick="deleteUser(${user.user_id})">Delete</button>
                        <button onclick="editUser(${user.user_id})">Edit</button>
                    </td>
                </tr>
            `;
        });

        usersHtml += `
                </tbody>
            </table>
            <div id="editUserFormContainer"></div>
            <h3>Add New User</h3>
            <form id="addUserForm">
                <input type="text" id="first_name" placeholder="First Name" required>
                <input type="text" id="last_name" placeholder="Last Name" required>
                <input type="email" id="email" placeholder="Email" required>
                <input type="password" id="password" placeholder="Password" required>
                <select id="role" required>
                    <option value="admin">Admin</option>
                    <option value="client">Client</option>
                    <option value="staff">Staff</option>
                </select>
                <button type="submit">Add User</button>
            </form>
        `;

        res.send(usersHtml);
    });
});


// Add a new user
app.post('/admin/add-user', async (req, res) => {
    const { first_name, last_name, email, password, role } = req.body;

    // Check if all fields are present
    if (!first_name || !last_name || !email || !password || !role) {
        return res.status(400).send('All fields are required.');
    }

    try {
        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insert the new user into the database
        const query = 'INSERT INTO users (first_name, last_name, email, password, role) VALUES (?, ?, ?, ?, ?)';
        db.query(query, [first_name, last_name, email, hashedPassword, role], (err, result) => {
            if (err) {
                console.error('Error adding user:', err);
                if (err.code === 'ER_DUP_ENTRY') {
                    return res.status(400).send('Email already registered.');
                }
                return res.status(500).send('Error adding user.');
            }
            res.status(201).send('User added successfully.');
        });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('Server error.');
    }
});


// Delete a user
app.delete('/admin/delete-user/:id', (req, res) => {
    const userId = req.params.id;
    const query = 'DELETE FROM users WHERE user_id = ?';

    db.query(query, [userId], (err) => {
        if (err) return res.status(500).send('Error deleting user.');
        res.status(200).send('User deleted successfully.');
    });
});

app.get('/admin/get-user/:id', (req, res) => {
    const userId = req.params.id;
    const query = 'SELECT * FROM users WHERE user_id = ?';

    db.query(query, [userId], (err, results) => {
        if (err) return res.status(500).send('Error retrieving user details.');
        if (results.length === 0) return res.status(404).send('User not found.');
        res.json(results[0]);
    });
});

app.put('/admin/edit-user/:id', (req, res) => {
    const userId = req.params.id;
    const { first_name, last_name, email, role } = req.body;

    // Check if all required fields are provided
    if (!first_name || !last_name || !email || !role) {
        return res.status(400).send('All fields are required.');
    }

    const query = 'UPDATE users SET first_name = ?, last_name = ?, email = ?, role = ? WHERE user_id = ?';
    db.query(query, [first_name, last_name, email, role, userId], (err) => {
        if (err) {
            console.error('Error updating user:', err);
            return res.status(500).send('Error updating user.');
        }
        res.send('User updated successfully.');
    });
});

app.get('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            return res.status(500).send('Error logging out.');
        }
        res.redirect('/login.html'); // Redirect to the login page after logging out
    });
});

// View all classes (for Manage Classes page)
// View all classes (for Manage Classes page)
app.get('/admin/manage-classes', (req, res) => {
    const classesQuery = 'SELECT * FROM classes';
    const instructorsQuery = 'SELECT user_id, CONCAT(first_name, " ", last_name) AS name FROM users WHERE role IN ("admin", "staff")';

    // Run both queries in parallel
    db.query(classesQuery, (err, classResults) => {
        if (err) return res.status(500).send('Error retrieving classes.');

        db.query(instructorsQuery, (err, instructorResults) => {
            if (err) return res.status(500).send('Error retrieving instructors.');

            let classesHtml = `
                <h2>Manage Classes</h2>
                <table border="1" width="100%" cellpadding="5">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Name</th>
                            <th>Description</th>
                            <th>Instructor</th>
                            <th>Start Time</th>
                            <th>End Time</th>
                            <th>Capacity</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
            `;

            classResults.forEach(classItem => {
                classesHtml += `
                    <tr>
                        <td>${classItem.class_id}</td>
                        <td>${classItem.class_name}</td>
                        <td>${classItem.description}</td>
                        <td>${classItem.instructor_id}</td>
                        <td>${classItem.start_time}</td>
                        <td>${classItem.end_time}</td>
                        <td>${classItem.max_capacity}</td>
                        <td>
                            <button onclick="deleteClass(${classItem.class_id})">Delete</button>
                        </td>
                    </tr>
                `;
            });

            classesHtml += `
                    </tbody>
                </table>

                <h3>Add New Class</h3>
                <form id="addClassForm">
                    <input type="text" id="class_name" placeholder="Class Name" required>
                    <textarea id="description" placeholder="Description"></textarea>

                    <select id="instructor_id" required>
                        <option value="">Select Instructor</option>
            `;

            instructorResults.forEach(instructor => {
                classesHtml += `<option value="${instructor.user_id}">${instructor.name}</option>`;
            });

            classesHtml += `
                    </select>
                    <input type="datetime-local" id="start_time" required>
                    <input type="datetime-local" id="end_time" required>
                    <input type="number" id="max_capacity" placeholder="Max Capacity" required>
                    <button type="submit">Add Class</button>
                </form>
            `;

            res.send(classesHtml);
        });
    });
});


// Add a new class
app.post('/admin/add-class', (req, res) => {
    const { class_name, description, instructor_id, start_time, end_time, max_capacity } = req.body;

    // Validate input to ensure all fields are present
    if (!class_name || !instructor_id || !start_time || !end_time || !max_capacity) {
        return res.status(400).send('All fields are required.');
    }

    const query = `
        INSERT INTO classes (class_name, description, instructor_id, start_time, end_time, max_capacity)
        VALUES (?, ?, ?, ?, ?, ?)
    `;

    db.query(
        query, 
        [class_name, description, instructor_id, start_time, end_time, max_capacity], 
        (err, result) => {
            if (err) {
                console.error('Error adding class:', err); // Log the error to the console for debugging
                return res.status(500).send('Error adding class. Please check the inputs and try again.');
            }
            res.status(201).send('Class added successfully.');
        }
    );
});


// Delete a class
app.delete('/admin/delete-class/:id', (req, res) => {
    const classId = req.params.id;
    const query = 'DELETE FROM classes WHERE class_id = ?';

    db.query(query, [classId], (err) => {
        if (err) return res.status(500).send('Error deleting class.');
        res.status(200).send('Class deleted successfully.');
    });
});



// Start the server
const PORT = 3000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
