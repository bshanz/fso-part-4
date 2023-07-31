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
    // add more blogs as needed
]

beforeEach(async () => {
    // delete all existing blogs
    await Blog.deleteMany({})

    // add initial blogs
    // Note: we're using Promise.all to ensure that all blogs have been saved
    // before we proceed with the tests. Promise.all takes an array of promises
    // and returns a new promise that only resolves when all the input promises have resolved.
    const blogObjects = initialBlogs.map(blog => new Blog(blog))
    const promiseArray = blogObjects.map(blog => blog.save())
    await Promise.all(promiseArray)
})

// test cases go here

test('blogs are returned as json', async () => {
  await api
    .get('/api/blogs')
    .expect(200)
    .expect('Content-Type', /application\/json/)
}, 100000)

test('there are two blogs', async () => {
    const response = await api.get('/api/blogs')
  
    expect(response.body).toHaveLength(2)
  })

test('First blog title is "Blog Title', async () =>{
    const response = await api.get('/api/blogs')

    expect(response.body[0].title).toBe("Blog Title")
})

test('Blog created successfully', async () => {
    const newBlog = {
        title: "New Blog",
        author: "JK Rowling",
        url: "http://google.com",
        likes: 100
    }

    const response = await api
        .post('/api/blogs')
        .send(newBlog)  // use .send() to include newBlog in the body of the request
        .expect(201)
        .expect('Content-Type', /application\/json/)
    
    // you can add other assertions here
})

test.only('If likes are missing make it 0', async () => {
    const newBlog = {
        title: "New Blog 24",
        author: "JK Rowling 24",
        url: "http://google.com/24",
    }

    const response = await api
        .post('/api/blogs')
        .send(newBlog)  // use .send() to include newBlog in the body of the request
        .expect(201)
        .expect('Content-Type', /application\/json/)
    
        expect(response.body.likes).toBe(0)
})

// test('Blog without required content is not added', async () => {
//     // You may replace 'title' with 'author', 'url', or 'likes' to test other fields
//     const newBlog = {
//         author: "JK Rowling",
//         url: "http://google.com",
//         likes: 100
//     }

//     await api
//         .post('/api/blogs')
//         .send(newBlog)
//         .expect(400)

//     const response = await api.get('/api/blogs')

//     // replace initialNotes with initialBlogs (or whatever the initial blog list is called)
//     expect(response.body).toHaveLength(2)
// })

test('Blog has an ID', async () =>{
    const response = await api.get('/api/blogs')

    expect(response.body[0]._id).toBeDefined()
})

afterAll(async () => {
  await mongoose.connection.close()
})