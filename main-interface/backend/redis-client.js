const util = require("./util");
const { promisify } = require("util");

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
    reconnectStrategy: (retries) => Math.min(retries * 1000, 60000),
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

const sessionStore = new redisStore({ client: redisSessionClient });

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

var adminClientConnected = false;

redisAdminClient.on("connect", function (err) {
  adminClientConnected = true;
  console.log(
    "- Connected to redis admin server successfully on port " +
      process.env.REDIS_ADMIN_PORT +
      " . (" +
      util.getCurrentDateTime() +
      ") -"
  );
});

redisAdminClient.on("error", function (err) {
  adminClientConnected = false;
  console.error(
    "- Could not establish a connection with redis admin server. " +
      err +
      " . (" +
      util.getCurrentDateTime() +
      ") -"
  );
});

async function authenticateAdmin(userID, password) {
  if (process.env.AUTH_DISABLED == "true") {
    return { valid: true };
  }

  if (adminClientConnected == false) {
    return { valid: false, error: "System error" };
  }

  const hget = promisify(redisAdminClient.HGET).bind(redisAdminClient);

  const result = await hget(userID, "password");

  if (result != null) {
    if (password == result) {
      return { valid: true };
    } else {
      return { valid: false, error: "Invalid password" };
    }
  } else {
    return { valid: false, error: "Invalid userID" };
  }
}

module.exports = { sessionStore, authenticateAdmin };
