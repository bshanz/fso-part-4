const blog = require("../models/blog")
const _ = require('lodash')


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

const mostBlogs = (blogs) => {
    // Count the occurrence of each author in the array of blogs
    const authors = _.countBy(blogs, 'author')
  
    // Find the author with the most blogs
    const maxAuthor = _.maxBy(_.keys(authors), (author) => authors[author])
  
    // Return the result
    return {
      author: maxAuthor,
      blogs: authors[maxAuthor],
    }
  }

  const mostLikes = (blogs) => {
      const authors = _.groupBy(blogs, 'author');
  
      const authorsWithLikes = _.map(authors, (blogs, author) => {
          return {
              author: author,
              likes: _.reduce(blogs, (sum, blog) => sum + blog.likes, 0)
          };
      });
  
      return _.maxBy(authorsWithLikes, 'likes');
  };
  

module.exports = {
    dummy,
    totalLikes,
    favoriteBlog,
    mostBlogs,
    mostLikes
  }