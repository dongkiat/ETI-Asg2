const util = require("./util");

const url = require("url");
const bodyParser = require("body-parser");
const cors = require("cors");
const express = require("express");
const session = require("express-session");

const studentNavItems = {
  Students: "8103/students",
  Modules: "8170/module",
  "Module Management": "8114/",
  "Bidding Dashboard": "8220/biddingDashboard",
  "Ratings and Comments Dashboard": "8130/feedback",
  "Marks Wallet": "8050/WalletHome.html",
  "Class Exchange": "8140/",
  "Social Feed": "8060/",
  Timetable: "8070/",
};

const tutorNavItems = {
  Modules: "8170/module",
  "Module Management": "8114/",
  "Marks Dashboard": "8120/api/V1/marksDashboard",
  "Ratings and Comments Dashboard": "8180/dashboard",
  Timetable: "8070/",
};

const corsOptions = {
  origin: ["http://10.31.11.11:8130", "http://10.31.11.11:8140"],
  credentials: true,
};

module.exports = function (mysqlHandler, redisHandler) {
  const app = express();
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: false }));
  app.use(express.urlencoded({ extended: false }));
  app.use(cors(corsOptions));

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
      var error = req.query.error;
      res.render("login.ejs", {
        error: error,
      });
    }
  });

  // Login request
  app.post("/login", async (req, res) => {
    if (
      ![req.body.userID, req.body.password, req.body.usertype].includes(
        undefined
      )
    ) {
      const authentication = await mysqlHandler.authenticateUser(
        req.body.userID,
        req.body.password,
        req.body.usertype
      );
      if (authentication.valid) {
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
      } else {
        res.redirect(
          url.format({
            pathname: "/",
            query: {
              error: authentication.error,
            },
          })
        );
      }
    }
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
    var error = req.query.error;
    res.render("admin-login.ejs", {
      error: error,
    });
  });

  // Admin login request
  app.post("/admin/login", async (req, res) => {
    const authentication = await redisHandler.authenticateAdmin(
      req.body.userID,
      req.body.password
    );

    if (authentication.valid) {
      if (req.body.usertype == "student") {
        res.redirect(
          "http://" + process.env.HOST + ":" + process.env.STUDENT_ADMIN_PATH
        );
      } else if (req.body.usertype == "tutor") {
        res.redirect(
          "http://" + process.env.HOST + ":" + process.env.TUTOR_ADMIN_PATH
        );
      }
    } else {
      res.redirect(
        url.format({
          pathname: "/admin",
          query: {
            error: authentication.error,
          },
        })
      );
    }
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
