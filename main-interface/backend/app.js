if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const util = require("./util");

const mysqlTutorConnection = require("./mysql-connection").tutorConnection;
const mysqlStudentConnection = require("./mysql-connection").studentConnection;

const express = require("express");
const session = require("express-session");

const redisStore = require("connect-redis")(session);
const redisClient = require("./redis-client");

const app = express();

app.set("view-engine", "ejs");
app.use(express.static("styles"));
app.use(express.static("media"));
app.use("/css", express.static("node_modules/bootstrap/dist/css"));
app.use("/js", express.static("node_modules/bootstrap/dist/js"));

app.use(express.urlencoded({ extended: false }));

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    store: new redisStore({
      client: redisClient,
    }),
    saveUninitialized: false,
    resave: false,
    rolling: true,
    cookie: {
      secure: false,
      httpOnly: false,
      maxAge: 1000 * 60 * 20,
    },
  })
);

// Get Main/Login page
app.get("/", (req, res) => {
  if (req.session.userID) {
    res.render("index.ejs", {
      userID: req.session.userID,
    });
  } else {
    res.render("login.ejs");
  }
});

// Login request
app.post("/login", (req, res) => {
  req.session.userID = req.body.userID;
  req.session.usertype = req.body.usertype;
  console.log(
    "- User Logged In . New Session Created . SID:" +
      req.sessionID +
      " . (" +
      util.getCurrentDateTime() +
      ") -"
  );
  res.redirect("/");
});

// Logout request
app.post("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return console.log(err);
    }
    console.log(
      "- User Logged Out . Session Destroyed . SID:" +
        req.sessionID +
        " . (" +
        util.getCurrentDateTime() +
        ") -"
    );
    res.redirect("/");
  });
});

// Admin ---------------------------------------------------------------------

// Get Admin Login page
app.get("/admin", (req, res) => {
  res.render("admin-login.ejs");
});

// Admin login request
app.post("/admin/login", (req, res) => {
  if (req.body.usertype == "student") {
    res.redirect(
      "http://" + process.env.HOST + ":" + process.env.STUDENT_ADMIN_PORT
    );
  } else if (req.body.usertype == "tutor") {
    res.redirect(
      "http://" + process.env.HOST + ":" + process.env.TUTOR_ADMIN_PORT
    );
  }
});

module.exports = {
  app,
  mysqlTutorConnection,
  mysqlStudentConnection,
  redisClient,
};
