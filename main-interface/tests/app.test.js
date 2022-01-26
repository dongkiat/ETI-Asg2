require("dotenv").config();

const request = require("supertest");

const mysqlHandler = require("./mysql-connection");
const redisHandler = require("./redis-client");

const initApp = require("../backend/app");
const app = initApp(mysqlHandler, redisHandler);

describe("Main Interface", () => {
  describe("- Get index page (/)", () => {
    test("render index page with login content when session not found", (done) => {
      request(app).get("/").expect(200, done);
    });
    test("render index page with home content when session found", (done) => {
      request(app).get("/").expect(200, done);
    });
  });

  describe("- Post login request (/login)", () => {
    test("redirect to index page on login success", (done) => {
      request(app)
        .post("/login")
        .send({
          userID: "123",
          password: "123",
          usertype: "student",
        })
        .expect(302)
        .expect("Location", "/", done);
    });
    test("redirect to index page on login fail", (done) => {
      request(app).post("/login").expect(302).expect("Location", "/", done);
    });
  });

  describe("- Post logout request (/logout)", () => {
    test("redirect to index page on logout success", (done) => {
      request(app).post("/logout").expect(302).expect("Location", "/", done);
    });
  });
});

describe("Admin interface", () => {
  describe("- Get admin login page (/admin)", () => {
    test("render admin login page", (done) => {
      request(app).get("/admin").expect(200, done);
    });
  });

  describe("- Post admin login request (/admin/login)", () => {
    test("redirect to student admin index page on login success", (done) => {
      request(app)
        .post("/admin/login")
        .send({
          userID: "123",
          password: "123",
          usertype: "student",
        })
        .expect(302)
        .expect(
          "Location",
          "http://" + process.env.HOST + ":" + process.env.STUDENT_ADMIN_PATH,
          done
        );
    });
    test("redirect to tutor admin index page on login success", (done) => {
      request(app)
        .post("/admin/login")
        .send({
          userID: "123",
          password: "123",
          usertype: "tutor",
        })
        .expect(302)
        .expect(
          "Location",
          "http://" + process.env.HOST + ":" + process.env.TUTOR_ADMIN_PATH,
          done
        );
    });
    test("redirect to index page on login fail", (done) => {
      request(app)
        .post("/admin/login")
        .expect(302)
        .expect("Location", "/admin", done);
    });
  });
});

afterAll((done) => {
  redisClient.disconnect(done);
  userDB.tutorConnection.end(done);
  userDB.studentConnection.end(done);
});
