const db = require("../db/connection");
const format = require("pg-format");

const fetchArticleById = (article_id) => {
  const queryString = format(
    `
    SELECT * FROM articles
    WHERE article_id = %L
    `,
    [article_id]
  );
  return db.query(queryString).then(({ rows }) => {
    if (rows.length === 0) {
      return Promise.reject({ status: 404, msg: "Article not found" });
    }
    return rows[0];
  });
};

module.exports = { fetchArticleById };
