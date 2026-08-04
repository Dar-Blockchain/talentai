const postRouter = require("./post.routes");
const postService = require("./post.service");
const Post = require("./post.model");

module.exports = {
  postRouter,
  postService,
  Post,
};
