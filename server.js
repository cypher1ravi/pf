const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
require('dotenv').config();


const app = express();
const port = process.env.PORT || 3000;
const uri = process.env.MONGO_URI

// Connect to MongoDB
mongoose.connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('ui')); // Serve static files from the 'public' directory

// MongoDB User schema
const User = mongoose.model('User', {
    username: String,
    password: String,
});

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/ui/index.html');
});

// Registration endpoint
app.post('/register', async (req, res) => {
    const { username, password } = req.body;

    try {
        // Check if the username already exists
        const existingUser = await User.findOne({ username });

        if (existingUser) {
            res.status(400).send('Username already exists');
        } else {
            // Hash the password before storing it in the database
            const hashedPassword = await bcrypt.hash(password, 10);

            // Create a new user
            const newUser = new User({
                username,
                password: hashedPassword,
            });

            // Save the user to the database
            await newUser.save();

            res.status(201).send('User registered successfully');
        }
    } catch (error) {
        console.error('Error during registration:', error);
        res.status(500).send('Internal Server Error');
    }
});

// Login endpoint
app.post('/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        const user = await User.findOne({ username });

        if (user && await bcrypt.compare(password, user.password)) {
            res.sendFile(__dirname + '/ui/adminPanel.html');
            // res.send(`Welcome, ${user.username}!`);

        } else {
            res.send('Invalid username or password');
        }
    } catch (error) {
        console.error('Error during login:', error);
        res.status(500).send('Internal Server Error');
    }
});
app.get('/logout', (req, res) => {
    res.redirect('/');

});


app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
