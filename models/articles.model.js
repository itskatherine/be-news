const db = require("../db/connection");
const format = require("pg-format");
const { fetchTopics } = require("./topics.model");

const fetchArticles = (topic, sort_by = "created_at", order = "DESC") => {
  const validOrders = ["ASC", "DESC"];
  if (!validOrders.includes(order)) {
    return Promise.reject({ status: 400, msg: "Bad request" });
  }
  const validSortBys = [
    "created_at",
    "votes",
    "author",
    "comment_count",
    "title",
    "topic",
  ];
  if (!validSortBys.includes(sort_by)) {
    return Promise.reject({ status: 400, msg: "Bad request" });
  }
  let topicQueryString = "";
  let sqlParametersArr = [];

  if (topic) {
    topicQueryString = "WHERE topic = $1";
    sqlParametersArr.push(topic);
  }

  const queryString = `
  SELECT articles.*, CAST(COUNT(comment_id) AS INT) AS comment_count
  FROM articles
  LEFT JOIN comments ON articles.article_id = comments.article_id
  ${topicQueryString}
  GROUP BY articles.article_id
  ORDER BY articles.${sort_by} ${order};
  `;
  const promises = [db.query(queryString, sqlParametersArr)];
  if (topic) promises.push(checkTopicExists(topic));

  return Promise.all(promises).then(([{ rows: articles }]) => {
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

const checkTopicExists = (topic) => {
  return fetchTopics().then((topics) => {
    const topicSlugs = topics.map((topic) => topic.slug);
    if (!topicSlugs.includes(topic)) {
      return Promise.reject({ status: 400, msg: "Bad request" });
    }
    return topic;
  });
};

module.exports = { updateArticle, fetchArticleById, fetchArticles };
