const bcrypt = require('bcryptjs');
const readline = require('readline');

// Set up readline interface to take input from the command line
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

// Function to hash the password
async function generateHash(password) {
    try {
        const saltRounds = 10; // Number of salt rounds (cost factor)
        const hash = await bcrypt.hash(password, saltRounds);
        console.log('Hashed Password:', hash);
    } catch (err) {
        console.error('Error generating hash:', err);
    }
}

// Prompt the user to enter a password
rl.question('Enter the password to hash: ', (password) => {
    generateHash(password);
    rl.close();
});
