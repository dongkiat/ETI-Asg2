if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const util = require("./util");

const redis = require("redis");
const session = require("express-session");
const redisStore = require("connect-redis")(session);

// Session Client -----------------------------------------------------------
const redisSessionClient = redis.createClient({
  url:
    "redis://" +
    process.env.REDIS_SESSION_HOST +
    ":" +
    process.env.REDIS_SESSION_PORT,
  legacyMode: true,
  socket: {
    reconnectStrategy: (retries) => Math.min(retries * 2000, 2000),
  },
});

redisSessionClient.connect();

redisSessionClient.on("connect", function (err) {
  console.log(
    "- Connected to redis session server successfully on port " +
      process.env.REDIS_SESSION_PORT +
      " . (" +
      util.getCurrentDateTime() +
      ") -"
  );
});

redisSessionClient.on("error", function (err) {
  console.error(
    "- Could not establish a connection with redis session server. " +
      err +
      " . (" +
      util.getCurrentDateTime() +
      ") -"
  );
});

sessionStore = new redisStore({ client: redisSessionClient });

// Admin Client -------------------------------------------------------------
const redisAdminClient = redis.createClient({
  url:
    "redis://" +
    process.env.REDIS_ADMIN_HOST +
    ":" +
    process.env.REDIS_ADMIN_PORT,
  legacyMode: true,
  socket: {
    reconnectStrategy: (retries) => Math.min(retries * 2000, 2000),
  },
});

redisAdminClient.connect();

redisAdminClient.on("connect", function (err) {
  console.log(
    "- Connected to redis admin server successfully on port " +
      process.env.REDIS_ADMIN_PORT +
      " . (" +
      util.getCurrentDateTime() +
      ") -"
  );
});

redisAdminClient.on("error", function (err) {
  console.error(
    "- Could not establish a connection with redis admin server. " +
      err +
      " . (" +
      util.getCurrentDateTime() +
      ") -"
  );
});

function authenticateAdmin(userID, password) {
  var authenticated = true;

  return authenticated;
}

module.exports = { redisSessionClient, sessionStore, authenticateAdmin };
