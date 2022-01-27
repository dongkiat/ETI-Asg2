if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const mysqlHandler = require("./mysql-connection");
const redisHandler = require("./redis-client");

const initApp = require("./app");
const app = initApp(mysqlHandler, redisHandler);

try {
  let server = app.listen(process.env.MAIN_PORT, () =>
    console.log("- listening on port " + server.address().port)
  );
} catch (err) {
  console.error(err);
  process.exit(1);
}
