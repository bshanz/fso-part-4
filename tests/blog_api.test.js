const mongoose = require('mongoose');
const supertest = require('supertest');
const app = require('../app');
const api = supertest(app);
const Blog = require('../models/blog');
const User = require('../models/user');
const bcrypt = require('bcrypt');

const initialBlogs = [
    {
        title: "Blog Title",
        author: "Author 1",
        url: "http://example.com/blog1",
        likes: 10
    },
    {
        title: "Blog 2",
        author: "Author 2",
        url: "http://example.com/blog2",
        likes: 20
    },
];

// Helper function to create a user and get a token
const getToken = async () => {
    await User.deleteMany({});

    const passwordHash = await bcrypt.hash('testpassword', 10);
    const user = new User({ username: 'testuser', passwordHash });
    await user.save();

    const response = await api
        .post('/api/login')
        .send({ username: 'testuser', password: 'testpassword' });

    return { token: response.body.token, userId: user.id };
};

beforeEach(async () => {
    await Blog.deleteMany({});

    let { token, userId } = await getToken();

    for (let blog of initialBlogs) {
        let blogObject = new Blog({ ...blog, user: userId });
        await blogObject.save();
    }
});

describe('when there is initially some blogs saved', () => {
    let token;

    beforeEach(async () => {
        let result = await getToken();
        token = result.token;
    });

    test('blogs are returned as json', async () => {
        await api
            .get('/api/blogs')
            .set('Authorization', `Bearer ${token}`)
            .expect(200)
            .expect('Content-Type', /application\/json/)
    });

    test('there are two blogs', async () => {
        const response = await api
            .get('/api/blogs')
            .set('Authorization', `Bearer ${token}`);

        expect(response.body).toHaveLength(2);
    });

    test('First blog title is "Blog Title"', async () => {
        const response = await api
            .get('/api/blogs')
            .set('Authorization', `Bearer ${token}`);

        expect(response.body[0].title).toBe("Blog Title");
    });

    test('Blog has an ID', async () => {
        const response = await api
            .get('/api/blogs')
            .set('Authorization', `Bearer ${token}`);

        expect(response.body[0].id).toBeDefined();
    });

    test('Getting a single blog by ID', async () => {
        const blogsAtStart = await api
            .get('/api/blogs')
            .set('Authorization', `Bearer ${token}`);

        const blogToView = blogsAtStart.body[0];

        const resultBlog = await api
            .get(`/api/blogs/${blogToView.id}`)
            .set('Authorization', `Bearer ${token}`)
            .expect(200)
            .expect('Content-Type', /application\/json/);

        expect(resultBlog.body).toEqual(blogToView);
    });

    test('a blog can be deleted', async () => {
        const newBlog = {
            title: "Blog to be deleted",
            author: "Deleter",
            url: "http://example.com/delete",
            likes: 1,
            user: await User.findOne({ username: 'testuser' })
        };

        const addedBlog = await api
            .post('/api/blogs')
            .set('Authorization', `Bearer ${token}`)
            .send(newBlog);

        const blogsAtStart = await api
            .get('/api/blogs')
            .set('Authorization', `Bearer ${token}`);

        await api
            .delete(`/api/blogs/${addedBlog.body.id}`)
            .set('Authorization', `Bearer ${token}`)
            .expect(204);

        const blogsAtEnd = await api
            .get('/api/blogs')
            .set('Authorization', `Bearer ${token}`);

        expect(blogsAtEnd.body).toHaveLength(blogsAtStart.body.length - 1);
        const titles = blogsAtEnd.body.map(b => b.title);
        expect(titles).not.toContain(newBlog.title);
    });
});

describe('addition of a new blog', () => {
    let token;

    beforeEach(async () => {
        let result = await getToken();
        token = result.token;
    });

    test('Blog created successfully with a valid token', async () => {
        const newBlog = {
            title: "New Blog",
            author: "JK Rowling",
            url: "http://google.com",
            likes: 100
        }

        await api
            .post('/api/blogs')
            .set('Authorization', `Bearer ${token}`)
            .send(newBlog)
            .expect(201)
            .expect('Content-Type', /application\/json/)
    });

    test('Adding a blog fails with status code 401 Unauthorized if a token is not provided', async () => {
        const newBlog = {
            title: "New Blog",
            author: "JK Rowling",
            url: "http://google.com",
            likes: 100
        }

        await api
            .post('/api/blogs')
            .send(newBlog)
            .expect(401)
    });

    test('If likes are missing make it 0', async () => {
        const newBlog = {
            title: "New Blog 24",
            author: "JK Rowling 24",
            url: "http://google.com/24",
        }

        const response = await api
            .post('/api/blogs')
            .set('Authorization', `Bearer ${token}`)
            .send(newBlog)
            .expect(201)
            .expect('Content-Type', /application\/json/)

        expect(response.body.likes).toBe(0)
    });

    test('If title or author is missing send 400', async () => {
        const newBlog = {
            url: "http://google.com/24",
        }

        await api
            .post('/api/blogs')
            .set('Authorization', `Bearer ${token}`)
            .send(newBlog)
            .expect(400)
    });
});

afterAll(async () => {
    await mongoose.connection.close();
});
