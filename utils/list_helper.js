const blog = require("../models/blog")

const dummy = (blogs) => {
    return 1
  }

const totalLikes = (blogs) => {
    let total = 0

    console.log("BLOGS LENGTH", blogs.length)

    if (blogs.length === 0){
        return 0
    }

    blogs.forEach(blog => {
        total += blog.likes
    });

    return total;
} 

const favoriteBlog = (blogs) => {

    let highestLikes = 0
    
    let mostLikedBlog = {
        title: "",
        author: "",
        likes: 0
    }

    blogs.forEach(blog => {
        if (blog.likes > highestLikes){
            highestLikes = blog.likes
            mostLikedBlog.title = blog.title
            mostLikedBlog.author = blog.author
            mostLikedBlog.likes = blog.likes
        }
    })

return mostLikedBlog;

}

module.exports = {
    dummy,
    totalLikes,
    favoriteBlog
  }