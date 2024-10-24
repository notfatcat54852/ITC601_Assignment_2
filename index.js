const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const PORT = 3000;

// Serve static files from the 'public' folder
app.use(express.static('public'));

const homeRoute = require('./home');
const classesRoute = require('./classes');
const usersRoute = require('./users');

app.use(bodyParser.urlencoded({ extended: false }));

// Use routes
app.use('/', homeRoute);
app.use('/', classesRoute);
app.use('/', usersRoute);

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
