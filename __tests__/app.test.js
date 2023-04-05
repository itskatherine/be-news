const request = require("supertest");
const testData = require("../db/data/test-data");
const seed = require("../db/seeds/seed");
const db = require("../db/connection");
const app = require("../app");

require("jest-sorted");

beforeEach(() => seed(testData));
afterAll(() => db.end());

describe("GET /api/topics", () => {
  test("200: should return an array the same length as the number of topics on the topics key", () => {
    return request(app)
      .get("/api/topics")
      .expect(200)
      .then(({ body }) => {
        const { topics } = body;
        expect(topics).toHaveLength(testData.topicData.length);
      });
  });
  test("200: each object in returned array should have correct properties", () => {
    return request(app)
      .get("/api/topics")
      .expect(200)
      .then(({ body: { topics } }) => {
        expect(topics).toHaveLength(testData.topicData.length);
        topics.forEach((topic) => {
          expect(topic).toMatchObject({
            slug: expect.any(String),
            description: expect.any(String),
          });
        });
      });
  });
  test("404: path not found if path is incorrect", () => {
    return request(app)
      .get("/api/toopics")
      .expect(404)
      .then(({ body }) => {
        expect(body).toEqual({ msg: "Path not found" });
      });
  });
});

describe("GET /api/articles/:article_id", () => {
  test("200: should return an article with the correct id on the key of article, with correct keys", () => {
    const id = 1;
    return request(app)
      .get(`/api/articles/${id}`)
      .expect(200)
      .then(({ body }) => {
        const { article } = body;
        expect(article).toBeInstanceOf(Object);
        expect(article).toMatchObject({
          author: expect.any(String),
          title: expect.any(String),
          article_id: id,
          body: expect.any(String),
          topic: expect.any(String),
          created_at: expect.any(String),
          votes: expect.any(Number),
          article_img_url: expect.any(String),
        });
      });
  });
  test("400: should return 400 and error message when given invalid id", () => {
    return request(app)
      .get("/api/articles/katherine")
      .expect(400)
      .then(({ body }) => {
        expect(body).toEqual({ msg: "Bad request" });
      });
  });
  test("404: should return 404 and error message when given valid but nonexistant id", () => {
    return request(app)
      .get("/api/articles/1000")
      .expect(404)
      .then(({ body }) => {
        expect(body).toEqual({ msg: "Article not found" });
      });
  });
});

describe("GET /api/articles", () => {
  test("200: should return an array of articles, with correct keys", () => {
    return request(app)
      .get("/api/articles")
      .expect(200)
      .then(({ body: { articles } }) => {
        expect(articles).toHaveLength(testData.articleData.length);
        articles.forEach((article) => {
          expect(article).toMatchObject({
            author: expect.any(String),
            title: expect.any(String),
            article_id: expect.any(Number),
            topic: expect.any(String),
            created_at: expect.any(String),
            votes: expect.any(Number),
            comment_count: expect.any(Number),
          });
        });
      });
  });
  test("200: returned articles should be in descending order", () => {
    return request(app)
      .get("/api/articles")
      .expect(200)
      .then(({ body }) => {
        const { articles } = body;
        expect(articles).toHaveLength(testData.articleData.length);
        expect(articles).toBeSorted({ key: "created_at", descending: true });
      });
  });
});

describe("GET /api/articles/:comment_id/comments", () => {
  test("200: should return an array of comments on the key of comments with the correct keys, sorted by earliest first", () => {
    const article_id = 1;
    const commentDataCopy = [...testData.commentData].map((elem) => {
      return { ...elem };
    });
    const commentsWithArticleId = commentDataCopy.filter(
      (comment) => comment.article_id === article_id
    );
    return request(app)
      .get(`/api/articles/${article_id}/comments`)
      .expect(200)
      .then(({ body: { comments } }) => {
        expect(comments).toBeInstanceOf(Array);
        expect(comments).toHaveLength(commentsWithArticleId.length);
        comments.forEach((comment) => {
          expect(comment).toMatchObject({
            comment_id: expect.any(Number),
            votes: expect.any(Number),
            created_at: expect.any(String),
            author: expect.any(String),
            body: expect.any(String),
            article_id: expect.any(Number),
          });
        });
        expect(comments).toBeSorted({ key: "created_at", descending: false });
      });
  });

  test("400: returns 400 and error message when invalid article id provided", () => {
    const article_id = "katherine";
    return request(app)
      .get(`/api/articles/${article_id}/comments`)
      .expect(400)
      .then(({ body }) => {
        expect(body).toEqual({ msg: "Bad request" });
      });
  });
  test("404: valid but non-existant article id", () => {
    const article_id = 100000;
    return request(app)
      .get(`/api/articles/${article_id}/comments`)
      .expect(404)
      .then(({ body }) => {
        expect(body).toEqual({ msg: "Article not found" });
      });
  });
  test("200: valid article id but article has no comments (like article 2)", () => {
    const article_id = 2;
    return request(app)
      .get(`/api/articles/${article_id}/comments`)
      .expect(200)
      .then(({ body: { comments } }) => {
        expect(comments).toEqual([]);
      });
  });
});

describe("POST /api/articles/:article_id/comments", () => {
  test("201: should respond with the posted comment, when given valid comment", () => {
    const articleToPostCommentTo = 3;
    const comment = { username: "lurker", body: "KATHERINE" };
    return request(app)
      .post(`/api/articles/${articleToPostCommentTo}/comments`)
      .send(comment)
      .then(({ body: { comment } }) => {
        expect(comment).toMatchObject({
          comment_id: expect.any(Number),
          username: expect.any(String),
          body: expect.any(String),
        });
      });
  });
  test("201: comment should be added to the article's comments in db", () => {
    const articleToPostCommentTo = 3;
    const comment = { username: "lurker", body: "KATHERINE" };
    const commentDataCopy = [...testData.commentData].map((elem) => {
      return { ...elem };
    });
    const commentsWithArticleId = commentDataCopy.filter(
      (comment) => comment.article_id === articleToPostCommentTo
    );
    return request(app)
      .post(`/api/articles/${articleToPostCommentTo}/comments`)
      .send(comment)
      .then(() => {
        return request(app)
          .get(`/api/articles/${articleToPostCommentTo}/comments`)
          .then(({ body: { comments } }) => {
            expect(comments.length).toBe(commentsWithArticleId.length + 1);
          });
      });
  });
  test("404: if valid but non existant article id provided", () => {
    const comment = { username: "lurker", body: "KATHERINE" };
    return request(app)
      .post(`/api/articles/10000000/comments`)
      .send(comment)
      .then(({ body }) => {
        expect(body).toEqual({ msg: "Article not found" });
      });
  });
  test("400: if non-valid article id provided", () => {
    const comment = { username: "lurker", body: "KATHERINE" };
    return request(app)
      .post(`/api/articles/katherine/comments`)
      .send(comment)
      .then(({ body }) => {
        expect(body).toEqual({ msg: "Bad request" });
      });
  });
  test("400 if invalid comment object provided", () => {
    const comment = {};
    return request(app)
      .post(`/api/articles/2/comments`)
      .send(comment)
      .then(({ body }) => {
        expect(body).toEqual({ msg: "Bad request" });
      });
  });
  test("400 if invalid username object provided", () => {
    const comment = { username: "KATHERINE", body: "KATHERINE" };
    return request(app)
      .post(`/api/articles/2/comments`)
      .send(comment)
      .then(({ body }) => {
        expect(body).toEqual({ msg: "Bad request" });
      });
  });
});

describe("PATCH /api/articles/:article_id", () => {
  test("should return patched article with updated votes", () => {
    const articleToPatch = 1; //current votes 100
    const patchObj = { inc_votes: 1 };
    return request(app)
      .patch(`/api/articles/${articleToPatch}`)
      .send(patchObj)
      .then(({ body }) => {
        const { article } = body;
        expect(article).toMatchObject({
          article_id: articleToPatch,
          title: expect.any(String),
          topic: expect.any(String),
          author: expect.any(String),
          body: expect.any(String),
          created_at: expect.any(String),
          votes: 101,
          article_img_url: expect.any(String),
        });
      });
  });
  test("404: article not found", () => {
    const articleToPatch = 10000;
    const patchObj = { inc_votes: 1 };
    return request(app)
      .patch(`/api/articles/${articleToPatch}`)
      .send(patchObj)
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).toBe("Article not found");
      });
  });
  test("400: invalid article ", () => {
    const articleToPatch = "katherine";
    const patchObj = { inc_votes: 1 };
    return request(app)
      .patch(`/api/articles/${articleToPatch}`)
      .send(patchObj)
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("Bad request");
      });
  });
  test("400: Bad request when an invalid comment provided", () => {
    const articleToPatch = 1; //current votes 100
    const patchObj = {};
    return request(app)
      .patch(`/api/articles/${articleToPatch}`)
      .send(patchObj)
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("Bad request");
      });
  });
  test("400: Bad request when invalid inc_votes provided", () => {
    const articleToPatch = 1; //current votes 100
    const patchObj = { inc_votes: "katherine" };
    return request(app)
      .patch(`/api/articles/${articleToPatch}`)
      .send(patchObj)
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("Bad request");
      });
  });
});

describe("DELETE: /api/comments/comment_id", () => {
  test("204: should delete comment", () => {
    const commentIdToDelete = 1;
    return request(app)
      .delete(`/api/comments/${commentIdToDelete}`)
      .expect(204)
      .then(() => {
        return db
          .query(
            `
        SELECT * FROM comments
        WHERE comment_id = ${commentIdToDelete};
        `
          )
          .then(({ rows }) => {
            expect(rows.length).toBe(0);
          });
      });
  });
  test("400: comment id invalid", () => {
    const commentIdToDelete = "katherine";
    return request(app)
      .delete(`/api/comments/${commentIdToDelete}`)
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("Bad request");
      });
  });
  test("404: comment id valid but non existant", () => {
    const commentIdToDelete = 100000;
    return request(app)
      .delete(`/api/comments/${commentIdToDelete}`)
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).toBe("Comment not found");
      });
  });
});

describe("GET /api/users", () => {
  test("200: should respond with an array of user objects", () => {
    return request(app)
      .get("/api/users")
      .expect(200)
      .then(({ body: { users } }) => {
        expect(users).toBeInstanceOf(Array);
        expect(users).toHaveLength(testData.userData.length);
        users.forEach((user) => {
          expect(user).toMatchObject({
            username: expect.any(String),
            name: expect.any(String),
            avatar_url: expect.any(String),
          });
        });
      });
  });
});

describe("GET /api/users add queries", () => {
  test("200: accepts a topic query which filters response by topic", () => {
    const queriedTopic = "mitch";
    return request(app)
      .get(`/api/articles?topic=${queriedTopic}`)
      .expect(200)
      .then(({ body }) => {
        const { articles } = body;
        expect(articles).toHaveLength(11);
        articles.forEach((article) => {
          expect(article.topic).toBe(queriedTopic);
        });
      });
  });
  test("200: accepts a sort_by query which sorts results by a key (default descending)", () => {
    const sort_by = "votes";
    return request(app)
      .get(`/api/articles?sort_by=${sort_by}`)
      .expect(200)
      .then(({ body }) => {
        const { articles } = body;
        expect(articles).toHaveLength(12);
        expect(articles).toBeSorted({ key: "votes", descending: true });
      });
  });
  test("400: gives error when invalid sort_by given", () => {
    const sort_by = "katherine";
    return request(app)
      .get(`/api/articles?sort_by=${sort_by}`)
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("Bad request");
      });
  });
  test("200:accepts an order query which changes the order of the returned array", () => {
    const order = "ASC";
    return request(app)
      .get(`/api/articles?order=${order}`)
      .expect(200)
      .then(({ body }) => {
        const { articles } = body;
        expect(articles).toHaveLength(testData.articleData.length);
        expect(articles).toBeSorted({ key: "created_at", descending: false });
      });
  });
  test("400: gives error when invalid order given", () => {
    const order = "katherine";
    return request(app)
      .get(`/api/articles?order=${order}`)
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("Bad request");
      });
  });

  test("200: gives empty array back when category exists but has no articles", () => {
    const topic = "paper";
    return request(app)
      .get(`/api/articles?topic=${topic}`)
      .expect(200)
      .then(({ body }) => {
        const { articles } = body;
        expect(articles).toEqual([]);
      });
  });
});

describe("GET /api/articles/:article_id (comment_count)", () => {
  test("200: should return article with comment count key", () => {
    const articleId = 6;
    return request(app)
      .get(`/api/articles/${articleId}`)
      .expect(200)
      .then(({ body: { article } }) => {
        expect(article.comment_count).toBe(1);
      });
  });
});

describe.only("GET /api", () => {
  test("200: should return endpoints object", () => {
    return request(app)
      .get("/api")
      .expect(200)
      .then(({ body }) => {
        const { endpoints } = body;
        expect(endpoints).toBeInstanceOf(Object);
      });
  });
});
