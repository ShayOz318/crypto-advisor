const express = require('express');

const app = express();

app.use(express.json());

const users = [];

app.get('/', (req, res) => {
    res.send('Hello from server!');
});

app.post('/signup', (req, res) => {
    const { name, email, password } = req.body;

    const newUser = {
        id: users.length + 1,
        name: name,
        email: email,
        password: password
    };

    users.push(newUser);

    res.status(201).json({
        message: 'User created successfully',
        user: newUser
    });
});

app.listen(3000, () => {
    console.log('Server is running on port 3000');
});