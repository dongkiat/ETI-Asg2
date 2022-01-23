const app = require("./app").app;

let server = app.listen(process.env.MAIN_PORT, () =>
  console.log("- listening on port " + server.address().port)
);
