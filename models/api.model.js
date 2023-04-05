const fs = require("fs/promises");

const fetchEndpoints = () => {
  return fs
    .readFile(`${__dirname}/../endpoints.json`, "utf-8")
    .then((contents) => {
      const parsedContents = JSON.parse(contents);
      console.log(typeof parsedContents);
      return parsedContents;
    });
};

module.exports = { fetchEndpoints };
