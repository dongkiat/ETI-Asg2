const request = require("supertest");
const app = require("./backend/app");

describe("Get index page (/)", () => {
  test("responds with a 200 status code", (done) => {
    request(app.app).get("/").expect(200, done);
  });

  afterAll((done) => {
    app.redisClient.disconnect(done);
  });
});
