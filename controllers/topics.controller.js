const { fetchTopics } = require("../models/topics.model");

const getTopics = (req, res) => {
  fetchTopics()
    .then((topics) => {
      res.status(200).send({ topics });
    })
    .catch((err) => console.log(err));
};

module.exports = { getTopics };
