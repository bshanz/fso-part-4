const blogsRouter = require('express').Router()
const Blog = require('../models/blog')

blogsRouter.get('/', async (request, response) => {
    try {
        const blogs = await Blog.find({})
    response.json(blogs)
    } catch (error) {
        console.log(error)
    }
    
  })

  blogsRouter.post('/', async (request, response) => {
    const blog = new Blog(request.body)

    console.log("REQUEST BODYYYYYY", request.body)

    try {
        const savedBlog = await blog.save()
        response.status(201).json(savedBlog)
    } catch (error) {
        console.log(error)
        response.status(400).send(error)
    }
})



module.exports = blogsRouter