const util = require("./util");

const express = require("express");
const bodyParser = require("body-parser");
const session = require("express-session");

const studentNavItems = {
  Modules: "8017/modules",
  "Bidding Dashboard": "8220/biddingDashboard",
  "Ratings and Comments Dashboard": "8130/feedback",
};

const tutorNavItems = {
  Modules: "8017/modules",
  "Marks Dashboard": "8120/api/V1/marksdashboard",
  "Ratings and Comments Dashboard": "8190/dashboard",
};

module.exports = function (mysqlHandler, redisHandler) {
  const app = express();
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: false }));
  app.use(express.urlencoded({ extended: false }));

  app.set("view-engine", "ejs");
  app.use(express.static("styles"));
  app.use(express.static("media"));
  app.use("/css", express.static("node_modules/bootstrap/dist/css"));
  app.use("/js", express.static("node_modules/bootstrap/dist/js"));

  app.use(
    session({
      secret: process.env.SESSION_SECRET,
      store: redisHandler.sessionStore,
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

  // Get Main Login page
  app.get("/", (req, res) => {
    if (req.session.userID && req.session.usertype) {
      var navItems;
      if (req.session.usertype == "student") {
        navItems = studentNavItems;
      } else if (req.session.usertype == "tutor") {
        navItems = tutorNavItems;
      }
      res.render("index.ejs", {
        usertype: req.session.usertype,
        navItems: navItems,
      });
    } else {
      res.render("login.ejs");
    }
  });

  // Login request
  app.post("/login", (req, res) => {
    if (
      ![req.body.userID, req.body.password, req.body.usertype].includes(
        undefined
      )
    ) {
      if (
        mysqlHandler.authenticateUser(
          req.body.userID,
          req.body.password,
          req.body.usertype
        )
      ) {
        req.session.userID = req.body.userID;
        req.session.usertype = req.body.usertype;
        console.log(
          "- User Logged In . New Session Created . SID:" +
            req.sessionID +
            " . (" +
            util.getCurrentDateTime() +
            ") -"
        );
      }
    }
    res.redirect("/");
  });

  // Logout request
  app.post("/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return console.error(err);
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
  app.post("/admin/login", async (req, res) => {
    const authenticated = await redisHandler.authenticateAdmin(
      req.body.userID,
      req.body.password
    );

    if (authenticated) {
      if (req.body.usertype == "student") {
        res.redirect(
          "http://" + process.env.HOST + ":" + process.env.STUDENT_ADMIN_PATH
        );
      } else if (req.body.usertype == "tutor") {
        res.redirect(
          "http://" + process.env.HOST + ":" + process.env.TUTOR_ADMIN_PATH
        );
      }
    }
    res.redirect("/admin");
  });

  // Others --------------------------------------------------------------------

  // Get session user details
  app.get("/session", (req, res) => {
    if (req.session.userID && req.session.usertype) {
      sessionUserDetails = {
        userID: req.session.userID,
        usertype: req.session.usertype,
      };
      res.end(JSON.stringify(sessionUserDetails));
      console.log(
        "- Session User Details Retrieval Success . SID:" +
          req.sessionID +
          " . (" +
          util.getCurrentDateTime() +
          ") -"
      );
    } else {
      res.sendStatus(404);
      console.log(
        "- Session User Details Retrieval Failed . Session Not Found . (" +
          util.getCurrentDateTime() +
          ") -"
      );
    }
  });

  // Capture invalid routes
  app.get("*", (req, res) => {
    res.redirect("/");
  });

  return app;
};
