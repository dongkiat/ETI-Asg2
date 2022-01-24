if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const util = require("./util");

const mysql = require("mysql");
const tutorConnection = mysql.createConnection({
  host: process.env.HOST,
  port: process.env.MYSQL_TUTOR_PORT,
  user: process.env.MYSQL_TUTOR_USERNAME,
  password: process.env.MYSQL_TUTOR_PASSWORD,
  database: process.env.MYSQL_TUTOR_DB,
});

tutorConnection.connect(function (err) {
  if (err) {
    console.error(
      "- Could not establish a connection with mysql tutor server. " +
        err +
        " . (" +
        util.getCurrentDateTime() +
        ") -"
    );
  } else {
    console.log(
      "- Connected to mysql tutor server successfully on port " +
        process.env.MYSQL_TUTOR_PORT +
        " . (" +
        util.getCurrentDateTime() +
        ") -"
    );
  }
});

const studentConnection = mysql.createConnection({
  host: process.env.HOST,
  port: process.env.MYSQL_STUDENT_PORT,
  user: process.env.MYSQL_STUDENT_USERNAME,
  password: process.env.MYSQL_STUDENT_PASSWORD,
  database: process.env.MYSQL_STUDENT_DB,
});

studentConnection.connect(function (err) {
  if (err) {
    console.error(
      "- Could not establish a connection with mysql student server. " +
        err +
        " . (" +
        util.getCurrentDateTime() +
        ") -"
    );
  } else {
    console.log(
      "- Connected to mysql student server successfully on port " +
        process.env.MYSQL_STUDENT_PORT +
        " . (" +
        util.getCurrentDateTime() +
        ") -"
    );
  }
});

module.exports = { tutorConnection, studentConnection };