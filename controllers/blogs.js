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

    // get the token from the request
    const decodedToken = jwt.verify(request.token, process.env.SECRET);
    if (!decodedToken.id) {
        return response.status(401).json({ error: 'token missing or invalid' });
    }

    // Retrieve the user based on the decoded token
    const user = await User.findById(decodedToken.id);

    if (!user) {
        return response.status(401).json({ error: 'Invalid user' });
    }

    const blog = new Blog({
        ...body,
        user: user._id, // This will now use the correct user ID from the database
    });

    try {
        const savedBlog = await blog.save();

        // Add the new blog's ID to the user's blogs array
        user.blogs = user.blogs.concat(savedBlog._id);
        await user.save();

        response.status(201).json(savedBlog);
    } catch (error) {
        console.log(error);
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
    const id = request.params.id;  // Get id from request parameters

    try {
        await Blog.findByIdAndRemove(id);  // Use mongoose's findByIdAndRemove function
        response.status(204).end();  // If successful, respond with no content
    } catch (exception) {
        console.error(exception);
        response.status(500).send({ error: 'something went wrong...' });
    }
})

module.exports = blogsRouter