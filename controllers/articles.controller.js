const {
  fetchArticleById,
  fetchArticles,
  updateArticle,
} = require("../models/articles.model");

const patchArticle = (req, res, next) => {
  const { inc_votes } = req.body;
  const { article_id } = req.params;

  updateArticle(inc_votes, article_id)
    .then((article) => {
      res.status(201).send({ article });
    })
    .catch(next);
};

const getArticles = (req, res, next) => {
  const { topic, sort_by, order } = req.query;
  fetchArticles(topic, sort_by, order)
    .then((articles) => {
      res.status(200).send({ articles });
    })
    .catch(next);
};

const getArticleById = (req, res, next) => {
  const { article_id } = req.params;
  fetchArticleById(article_id)
    .then((article) => {
      res.status(200).send({ article });
    })
    .catch(next);
};

module.exports = { patchArticle, getArticleById, getArticles };
