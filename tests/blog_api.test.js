const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')

const api = supertest(app)

test('blogs are returned as json', async () => {
  await api
    .get('/api/blogs')
    .expect(200)
    .expect('Content-Type', /application\/json/)
}, 100000)

test('there is one note', async () => {
    const response = await api.get('/api/blogs')
  
    expect(response.body).toHaveLength(1)
  })

test('First blog title is "Blog Title', async () =>{
    const response = await api.get('/api/blogs')

    expect(response.body[0].title).toBe("Blog Title")
})

afterAll(async () => {
  await mongoose.connection.close()
})