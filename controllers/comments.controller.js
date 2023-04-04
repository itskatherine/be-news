const {
  fetchCommentsByArticleId,
  addCommentByArticleId,
  removeComment,
} = require("../models/comments.model");

const deleteComment = (req, res, next) => {
  const { comment_id } = req.params;
  removeComment(comment_id)
    .then(() => {
      res.status(204).send();
    })
    .catch(next);
};

const getCommentsByArticleId = (req, res, next) => {
  const { article_id } = req.params;
  fetchCommentsByArticleId(article_id)
    .then((comments) => {
      res.status(200).send({ comments });
    })
    .catch(next);
};

const postCommentByArticleId = (req, res, next) => {
  const { username, body } = req.body;
  const { article_id } = req.params;
  addCommentByArticleId(article_id, username, body)
    .then((comment) => {
      res.status(201).send({ comment });
    })
    .catch(next);
};

module.exports = {
  deleteComment,
  getCommentsByArticleId,
  postCommentByArticleId,
};
