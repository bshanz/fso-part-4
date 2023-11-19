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

usersRouter.get('/', async (request, response) => {
    const users = await User
        .find({}).populate({
            path: 'blogs', // Assuming 'blogs' is the field in the User model referencing the Blog model
            select: 'title author url likes' // Select the fields you want from the Blog model
        });

    response.json(users);
});


module.exports = usersRouter