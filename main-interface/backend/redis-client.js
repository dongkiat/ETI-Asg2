if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const util = require("./util");

const redis = require("redis");
var redisClient = redis.createClient({
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

redisClient.connect();

redisClient.on("connect", function (err) {
  console.log(
    "- Connected to redis session server successfully on port " +
      process.env.REDIS_SESSION_PORT +
      " . (" +
      util.getCurrentDateTime() +
      ") -"
  );
});

redisClient.on("error", function (err) {
  console.error(
    "- Could not establish a connection with redis session server. " +
      err +
      " . (" +
      util.getCurrentDateTime() +
      ") -"
  );
  // process.exit(1);
});

module.exports = redisClient;
