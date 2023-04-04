const db = require("../db/connection");
const format = require("pg-format");
const { fetchArticleById } = require("./articles.model");

const removeComment = (comment_id) => {
  return db
    .query(
      `
  DELETE from comments
  WHERE comment_id = $1
  RETURNING *
  `,
      [comment_id]
    )
    .then((response) => {
      if (response.rowCount === 0) {
        return Promise.reject({ status: 404, msg: "Comment not found" });
      }
    });
};

const addCommentByArticleId = (article_id, username, body) => {
  const queryString = `
    INSERT INTO comments 
    (body, article_id, author)
    VALUES
    ($1,$2,$3)
    RETURNING *;
  `;
  return db
    .query(queryString, [body, article_id, username])
    .then(({ rows }) => {
      const comment = rows[0];
      const correctedComment = { ...comment };
      correctedComment.username = comment.author;
      delete correctedComment.author;
      return correctedComment;
    });
};

const fetchCommentsByArticleId = (article_id) => {
  return fetchArticleById(article_id).then(() => {
    const queryString = `
      SELECT * FROM comments
      WHERE article_id = $1
      ORDER BY created_at ASC;
      `;

    return db.query(queryString, [article_id]).then(({ rows: comments }) => {
      return comments;
    });
  });
};

module.exports = {
  fetchCommentsByArticleId,
  addCommentByArticleId,
  removeComment,
};
