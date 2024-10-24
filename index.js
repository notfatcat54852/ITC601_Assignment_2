const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const PORT = 3000;

// Serve static files from 'public' folder
app.use(express.static('public'));

// Parse form data
app.use(bodyParser.urlencoded({ extended: false }));

// Import routes
const homeRoute = require('./home');
const classesRoute = require('./classes');
const usersRoute = require('./users');
const signupRoute = require('./signup');
const loginRoute = require('./login');

// Use routes
app.use('/', homeRoute);
app.use('/', classesRoute);
app.use('/', usersRoute);
app.use('/', signupRoute);
app.use('/', loginRoute);

// Start server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
