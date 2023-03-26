const db = require("../db/connection");
const format = require("pg-format");
const { fetchArticleById } = require("./articles.model");

const addCommentByArticleId = (article_id, username, body) => {
  const queryString = format(
    `
    INSERT INTO comments 
    (body, article_id, author)
    VALUES
    %L
    RETURNING *;
  `,
    [[body, article_id, username]]
  );

  return db.query(queryString).then(({ rows }) => {
    const comment = rows[0];
    const correctedComment = { ...comment };
    correctedComment.username = comment.author;
    delete correctedComment.author;
    return correctedComment;
  });
};

const fetchCommentsByArticleId = (article_id) => {
  return fetchArticleById(article_id).then(() => {
    const queryString = format(
      `
      SELECT * FROM comments
      WHERE article_id = %L
      ORDER BY created_at ASC;
      `,
      [article_id]
    );
    return db.query(queryString).then(({ rows: comments }) => {
      return comments;
    });
  });
};

module.exports = { fetchCommentsByArticleId, addCommentByArticleId };
