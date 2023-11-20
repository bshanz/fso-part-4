const blogsRouter = require('express').Router()
const { get } = require('config')
const { response } = require('../app')
const Blog = require('../models/blog')
const User = require('../models/user')
const jwt = require('jsonwebtoken')

const getTokenFrom = request => {
    const authorization = request.get('authorization')
    if (authorization && authorization.toLowerCase().startsWith('bearer')) {
        return authorization.substring(7) // 'Bearer ' has 7 characters
    }
    return null
}


blogsRouter.get('/', async (request, response) => {
    try {
        const blogs = await Blog.find({})
        response.json(blogs)
    } catch (error) {
        console.log(error)
    }

})

blogsRouter.post('/', async (request, response) => {
    const body = request.body;
    const user = request.user;  // User is already extracted by the middleware

    const blog = new Blog({
        ...body,
        user: user._id  // Use the user's ID directly from the request object
    });

    try {
        const savedBlog = await blog.save();
        user.blogs = user.blogs.concat(savedBlog._id);  // Add blog to user's blogs
        await user.save();
        response.status(201).json(savedBlog);
    } catch (error) {
        console.error(error);
        response.status(400).send(error);
    }
});



blogsRouter.get('/:id', async (request, response, next) => {
    try {
        const blog = await Blog.findById(request.params.id)
        if (blog) {
            response.json(blog)
        } else {
            response.status(404).send({ error: 'Blog not found' })
        }
    } catch (error) {
        console.log(error)
        next(error) // pass the error to the next middleware
    }
})

blogsRouter.delete('/:id', async (request, response) => {
    const id = request.params.id;
    const user = request.user;  // User is already extracted by the middleware

    try {
        const blog = await Blog.findById(id);
        if (!blog) {
            return response.status(404).json({ error: 'Blog not found' });
        }

        // Check if the blog belongs to the user
        if (blog.user.toString() !== user._id.toString()) {
            return response.status(401).json({ error: 'only the creator can delete this blog' });
        }

        await Blog.findByIdAndRemove(id);
        response.status(204).end();
    } catch (error) {
        console.error(error);
        response.status(500).send({ error: 'something went wrong...' });
    }
});



module.exports = blogsRouter