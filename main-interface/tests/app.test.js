require("dotenv").config();

const request = require("supertest");

const session = require("express-session");
const FileStore = require("session-file-store")(session);
const sessionStore = new FileStore({ path: "./tests/sessions" });

function authenticateUser(userID, password, usertype) {
  if (userID == "123") {
    if (password == "123") {
      return { valid: true };
    } else {
      return { valid: false, error: "Invalid password" };
    }
  } else {
    return { valid: false, error: "Invalid userID" };
  }
}

function authenticateAdmin(userID, password) {
  if (userID == "123") {
    if (password == "123") {
      return { valid: true };
    } else {
      return { valid: false, error: "Invalid password" };
    }
  } else {
    return { valid: false, error: "Invalid userID" };
  }
}

const mysqlHandler = { authenticateUser };
const redisHandler = { sessionStore, authenticateAdmin };

const initApp = require("../backend/app");
const app = initApp(mysqlHandler, redisHandler);

describe("Main Interface", () => {
  describe("- Get index page (/)", () => {
    test("render index page with login content when session not found", (done) => {
      request(app).get("/").expect(200, done);
    });
    test("render index page with home content when session found", (done) => {
      request(app)
        .post("/login")
        .send({
          userID: "123",
          password: "123",
          usertype: "student",
        })
        .end((err, res) => {
          request(app)
            .get("/")
            .set("Cookie", res.header["set-cookie"])
            .expect(200, done);
        });
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
    test("redirect to index page on login fail with invalid userID", (done) => {
      request(app)
        .post("/login")
        .send({
          userID: "321",
          password: "123",
          usertype: "student",
        })
        .expect(302)
        .expect("Location", "/?error=Invalid%20userID", done);
    });
    test("redirect to index page on login fail with invalid password", (done) => {
      request(app)
        .post("/login")
        .send({
          userID: "123",
          password: "321",
          usertype: "student",
        })
        .expect(302)
        .expect("Location", "/?error=Invalid%20password", done);
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
    test("redirect to admin login page on login fail with invalid userID", (done) => {
      request(app)
        .post("/admin/login")
        .send({
          userID: "321",
          password: "123",
          usertype: "tutor",
        })
        .expect(302)
        .expect("Location", "/admin?error=Invalid%20userID", done);
    });
    test("redirect to admin login page on login fail with invalid password", (done) => {
      request(app)
        .post("/admin/login")
        .send({
          userID: "123",
          password: "321",
          usertype: "tutor",
        })
        .expect(302)
        .expect("Location", "/admin?error=Invalid%20password", done);
    });
  });
});

describe("Others", () => {
  describe("- Session API", () => {
    test("return 404 error when session not found", (done) => {
      request(app).get("/session").expect(404, done);
    });
    test("return session details when session found", (done) => {
      var agent = request.agent(app);
      agent
        .post("/login")
        .send({
          userID: "123",
          password: "123",
          usertype: "student",
        })
        .end((err, res) => {
          request(app)
            .get("/session")
            .set("Cookie", res.header["set-cookie"])
            .expect(200)
            .end((err, res) => {
              expect(res.text).toEqual('{"userID":"123","usertype":"student"}');
              return done();
            });
        });
    });
  });

  describe("- Invalid routes", () => {
    test("redirect to index page on capturing invalid routes", (done) => {
      request(app).get("/somepage").expect(302).expect("location", "/", done);
    });
  });
});

afterAll((done) => {
  sessionStore.clear(done);
});
