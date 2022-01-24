if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
  const { reset } = require("nodemon");
}

const mysql = require("mysql");
const mysqlTutorConnection = mysql.createConnection({
  host: process.env.HOST,
  port: process.env.MYSQL_TUTOR_PORT,
  user: process.env.MYSQL_TUTOR_USERNAME,
  password: process.env.MYSQL_TUTOR_PASSWORD,
  database: "tutors",
});

mysqlTutorConnection.connect(function (err) {
  if (err) {
    console.error(
      "- Could not establish a connection with mysql tutor server. " +
        err +
        " . (" +
        getCurrentDateTime() +
        ") -"
    );
  }
  console.log(
    "- Connected to mysql tutor server successfully on port " +
      process.env.MYSQL_TUTOR_PORT +
      " . (" +
      getCurrentDateTime() +
      ") -"
  );
});

const express = require("express");
const session = require("express-session");

const redis = require("redis");
const redisStore = require("connect-redis")(session);
const redisClient = redis.createClient({
  url:
    "redis://" +
    process.env.REDIS_SESSION_HOST +
    ":" +
    process.env.REDIS_SESSION_PORT,
  legacyMode: true,
});

redisClient.connect();

redisClient.on("error", function (err) {
  console.error(
    "- Could not establish a connection with redis session server. " +
      err +
      " . (" +
      getCurrentDateTime() +
      ") -"
  );
});
redisClient.on("connect", function (err) {
  console.log(
    "- Connected to redis session server successfully on port " +
      process.env.REDIS_SESSION_PORT +
      " . (" +
      getCurrentDateTime() +
      ") -"
  );
});

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
      getCurrentDateTime() +
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
        getCurrentDateTime() +
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

// Utility functions -----------------------------------------------------------

function getCurrentDateTime() {
  const now = new Date();

  const year = now.getFullYear();
  const month = ("0" + (now.getMonth() + 1)).slice(-2);
  const day = ("0" + now.getDate()).slice(-2);

  const hour = ("0" + now.getHours()).slice(-2);
  const minute = ("0" + now.getMinutes()).slice(-2);
  const second = ("0" + now.getSeconds()).slice(-2);

  const formattedDateTime = `${year}-${month}-${day} ${hour}:${minute}:${second}`;

  return formattedDateTime;
}

module.exports = { app, mysqlTutorConnection, redisClient };
