const express = require('express');
const bodyParser = require('body-parser');
const homeRoute = require('./home');
const viewUsersRoute = require('./view_users');
const viewClassesRoute = require('./view_classes');
const addUserRoute = require('./add_user');
const addClassRoute = require('./add_class');
const bookClassRoute = require('./book_class');

const app = express();
const PORT = 3000;

app.use(bodyParser.urlencoded({ extended: false }));

// Use Routes
app.use('/', homeRoute);              // Home Route
app.use('/', viewUsersRoute);          // View Users Route
app.use('/', viewClassesRoute);        // View Classes Route
app.use('/', addUserRoute);            // Add User Route
app.use('/', addClassRoute);           // Add Class Route
app.use('/', bookClassRoute);          // Book Class Route

// Start the Server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
