const db = require("../db/connection");
const format = require("pg-format");
const { fetchArticleById } = require("./articles.model");

const fetchCommentsByArticleId = (article_id) => {
  return fetchArticleById(article_id).then(() => {
    const queryString = format(
      `
      SELECT * FROM comments
      WHERE article_id = %L
      `,
      [article_id]
    );
    return db.query(queryString).then(({ rows: comments }) => {
      return comments;
    });
  });
};

module.exports = { fetchCommentsByArticleId };
