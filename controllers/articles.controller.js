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

const getArticles = (req, res) => {
  fetchArticles().then((articles) => {
    res.status(200).send({ articles });
  });
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
