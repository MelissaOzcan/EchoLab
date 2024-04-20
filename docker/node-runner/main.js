const fs = require('fs');

fs.readFile('code.js', 'utf8', (err, code) => {
    if (err) {
        console.error('Error reading the code file:', err);
        process.exit(1);
    }

    try {
        // Evaluating the code
        eval(code);
    } catch (error) {
        console.error('Error during execution:', error);
    }
});
