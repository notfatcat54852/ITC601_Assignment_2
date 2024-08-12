you need to start xampp specifically mysql and apache
<br>go to phpmyadmin and make sure there is a database named "login_system"
<br>the following sql command only needs to be run ONCE to make the sql table
<br>run the following sql command to create the appropriate table:
<br>CREATE TABLE users (id INT AUTO_INCREMENT PRIMARY KEY,username VARCHAR(255) UNIQUE NOT NULL,password VARCHAR(255) NOT NULL);
<br>then run "node server.js" from the root directory of the project
<br>then go to phpmyadmin and localhost:3000
<br>localhost:3000/index.html or localhost:3000/login.html
<br>can run "node newhash.js" to generate a new password hash
