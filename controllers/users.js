const bcrypt = require('bcrypt')
const usersRouter = require('express').Router()
const User = require('../models/user')

usersRouter.post('/', async (request, response, next) => {
    const { username, name, password } = request.body;

    if (!username || !password) {
        return response.status(400).json({ error: 'Username and password are required' });
    }

    if (username.length < 3 || password.length < 3) {
        return response.status(400).json({ error: 'Username and password must be at least 3 characters long' });
    }

    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    const user = new User({
        username,
        name,
        passwordHash,
    });

    try {
        const savedUser = await user.save();
        response.status(201).json(savedUser);
    } catch (error) {
        if (error.code === 11000) {
            // Duplicate username
            return response.status(400).json({ error: 'Username already taken' });
        }
        next(error); // Pass other errors to the error handling middleware
    }
});

module.exports = usersRouter