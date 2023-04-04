const express = require("express");
const {
  getArticleById,
  getArticles,
  patchArticle,
} = require("./controllers/articles.controller");
const {
  getCommentsByArticleId,
  postCommentByArticleId,
  deleteComment,
} = require("./controllers/comments.controller");
const {
  badPathCatcher,
  PSQLErrorCatcher,
  customErrorCatcher,
  error500Catcher,
} = require("./controllers/errors.controller");
const { getTopics } = require("./controllers/topics.controller");
const { getUsers } = require("./controllers/users.controller");
const app = express();
app.use(express.json());

app.get("/api/topics", getTopics);
app.get("/api/articles/:article_id", getArticleById);
app.get("/api/articles", getArticles);
app.get("/api/articles/:article_id/comments", getCommentsByArticleId);
app.post("/api/articles/:article_id/comments", postCommentByArticleId);
app.patch("/api/articles/:article_id", patchArticle);
app.delete("/api/comments/:comment_id", deleteComment);
app.get("/api/users", getUsers);

app.use("*", badPathCatcher);

app.use(PSQLErrorCatcher);

app.use(customErrorCatcher);

app.use(error500Catcher);

module.exports = app;
