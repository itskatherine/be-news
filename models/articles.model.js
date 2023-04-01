const db = require("../db/connection");
const format = require("pg-format");

const fetchArticles = () => {
  return db
    .query(
      `
  SELECT articles.*, CAST(COUNT(comment_id) AS INT) AS comment_count
  FROM articles
  LEFT JOIN comments ON articles.article_id = comments.article_id
  GROUP BY articles.article_id
  ORDER BY articles.created_at DESC;
  `
    )
    .then(({ rows: articles }) => {
      return articles;
    });
};

const fetchArticleById = (article_id) => {
  const queryString = format(
    `
    SELECT * FROM articles
    WHERE article_id = %L
    `,
    [article_id]
  );
  return db.query(queryString).then(({ rows: articles }) => {
    if (articles.length === 0) {
      return Promise.reject({ status: 404, msg: "Article not found" });
    }
    return articles[0];
  });
};

const updateArticle = (inc_votes, article_id) => {
  const queryString = `
  UPDATE articles
  SET
  votes = votes + $1
  WHERE article_id = $2
  RETURNING *;
  `;
  return db.query(queryString, [inc_votes, article_id]).then(({ rows }) => {
    const patchedArticle = rows[0];
    if (!patchedArticle) {
      return Promise.reject({ status: 404, msg: "Article not found" });
    }
    return patchedArticle;
  });
};

module.exports = { updateArticle, fetchArticleById, fetchArticles };
