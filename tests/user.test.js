// user.test.js
const mongoose = require('mongoose');
const supertest = require('supertest');
const bcrypt = require('bcrypt');
const app = require('../app'); // The path to your Express application
const User = require('../models/user'); // The path to your User model

// Initialize supertest with the app
const api = supertest(app);

// Helper function to retrieve all users from the database
async function usersInDb() {
    const users = await User.find({});
    return users.map(u => u.toJSON());
}

describe('when there is initially one user in the database', () => {
    beforeEach(async () => {
        await User.deleteMany({});

        const passwordHash = await bcrypt.hash('sekret', 10);
        const user = new User({
            username: 'root',
            passwordHash,
        });

        await user.save();
    });

    test('creation succeeds with a fresh username', async () => {
        const usersAtStart = await usersInDb();

        const newUser = {
            username: 'mluukkai',
            name: 'Matti Luukkainen',
            password: 'salainen',
        };

        await api
            .post('/api/users')
            .send(newUser)
            .expect(201)
            .expect('Content-Type', /application\/json/);

        const usersAtEnd = await usersInDb();
        expect(usersAtEnd).toHaveLength(usersAtStart.length + 1);

        const usernames = usersAtEnd.map(u => u.username);
        expect(usernames).toContain(newUser.username);
    });

    // tests/user.test.js
    test('creation fails with proper statuscode and message if username is already taken', async () => {
        const usersAtStart = await usersInDb();

        const newUser = {
            username: 'root', // This username already exists from the beforeEach hook
            name: 'Superuser',
            password: 'salainen',
        };

        const result = await api
            .post('/api/users')
            .send(newUser)
            .expect(400)
            .expect('Content-Type', /application\/json/);

        expect(result.body.error).toContain('Username already taken');

        const usersAtEnd = await usersInDb();
        expect(usersAtEnd).toHaveLength(usersAtStart.length);
    }, 10000); // Increase the timeout to 10000 ms if necessary


    // Add more tests as needed

    test('creation fails with a status code 400 if username is not given', async () => {
        const usersAtStart = await usersInDb();

        const newUser = {
            name: 'NoUsername',
            password: 'salainen',
        };

        await api
            .post('/api/users')
            .send(newUser)
            .expect(400);

        const usersAtEnd = await usersInDb();
        expect(usersAtEnd).toHaveLength(usersAtStart.length);
    });

    test('creation fails with a status code 400 if password is not given', async () => {
        const usersAtStart = await usersInDb();

        const newUser = {
            username: 'NoPassword',
            name: 'NoPassword',
        };

        await api
            .post('/api/users')
            .send(newUser)
            .expect(400);

        const usersAtEnd = await usersInDb();
        expect(usersAtEnd).toHaveLength(usersAtStart.length);
    });

    test('creation fails with a status code 400 if username or password is shorter than 3 characters', async () => {
        const usersAtStart = await usersInDb();

        const newUserShortUsername = {
            username: 'np',
            name: 'ShortUsername',
            password: 'salainen',
        };

        const newUserShortPassword = {
            username: 'ShortPassword',
            name: 'ShortPassword',
            password: 'np',
        };

        await api
            .post('/api/users')
            .send(newUserShortUsername)
            .expect(400);

        await api
            .post('/api/users')
            .send(newUserShortPassword)
            .expect(400);

        const usersAtEnd = await usersInDb();
        expect(usersAtEnd).toHaveLength(usersAtStart.length);
    });

    // Close the MongoDB connection after all tests are done
    afterAll(() => {
        mongoose.connection.close();
    });
});
