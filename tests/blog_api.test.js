const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')

const api = supertest(app)

const Blog = require('../models/blog')

// initialBlogs can be an array of blog objects that you want to add to the database
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
]

// Create the blogs in order of initial blogs.
beforeEach(async () => {
    await Blog.deleteMany({})

    for (let blog of initialBlogs) {
        let blogObject = new Blog(blog)
        await blogObject.save()
    }
})

// Test cases below.
describe('when there is initially some blogs saved', () => {
    test('blogs are returned as json', async () => {
        await api
            .get('/api/blogs')
            .expect(200)
            .expect('Content-Type', /application\/json/)
    })

    test('there are two blogs', async () => {
        const response = await api.get('/api/blogs')
        expect(response.body).toHaveLength(2)
    })

    test('First blog title is "Blog Title', async () => {
        const response = await api.get('/api/blogs')
        expect(response.body[0].title).toBe("Blog Title")
    })

    test('Blog has an ID', async () => {
        const response = await api.get('/api/blogs')
        expect(response.body[0]._id).toBeDefined()
    })

    test('Getting a single blog by ID', async () => {
        const blogsAtStart = await api.get('/api/blogs')
        const blogToView = blogsAtStart.body[0]

        const resultBlog = await api
            .get(`/api/blogs/${blogToView.id}`)
            .expect(200)
            .expect('Content-Type', /application\/json/)

        expect(resultBlog.body).toEqual(blogToView)
    })

    test('a blog can be deleted', async () => {
        let blogsAtStart = await api.get('/api/blogs');
        const blogToDelete = blogsAtStart.body[0];
        await api.delete(`/api/blogs/${blogToDelete.id}`).expect(204);
        const blogsAtEnd = await api.get('/api/blogs');
        expect(blogsAtEnd.body).toHaveLength(blogsAtStart.body.length - 1);
        const titles = blogsAtEnd.body.map(b => b.title);
        expect(titles).not.toContain(blogToDelete.title);
    })
})

describe('addition of a new blog', () => {
    test('Blog created successfully', async () => {
        const newBlog = {
            title: "New Blog",
            author: "JK Rowling",
            url: "http://google.com",
            likes: 100
        }

        await api
            .post('/api/blogs')
            .send(newBlog)
            .expect(201)
            .expect('Content-Type', /application\/json/)
    })

    test('If likes are missing make it 0', async () => {
        const newBlog = {
            title: "New Blog 24",
            author: "JK Rowling 24",
            url: "http://google.com/24",
        }

        const response = await api
            .post('/api/blogs')
            .send(newBlog)
            .expect(201)
            .expect('Content-Type', /application\/json/)
    
        expect(response.body.likes).toBe(0)
    })

    test('If title or author is missing send 400', async () => {
        const newBlog = {
            url: "http://google.com/24",
        }

        await api
            .post('/api/blogs')
            .send(newBlog)
            .expect(400)
    })
})

afterAll(async () => {
    await mongoose.connection.close()
})
