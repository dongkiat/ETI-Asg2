const util = require("./util");
const { promisify } = require("util");

const mysql = require("mysql2");

const studentOptions = {
  host: process.env.MYSQL_HOST,
  port: process.env.MYSQL_STUDENT_PORT,
  user: process.env.MYSQL_STUDENT_USERNAME,
  password: process.env.MYSQL_STUDENT_PASSWORD,
  database: process.env.MYSQL_STUDENT_DB,
};

const tutorOptions = {
  host: process.env.MYSQL_HOST,
  port: process.env.MYSQL_TUTOR_PORT,
  user: process.env.MYSQL_TUTOR_USERNAME,
  password: process.env.MYSQL_TUTOR_PASSWORD,
  database: process.env.MYSQL_TUTOR_DB,
};

var studentConnection;
var tutorConnection;

async function connectStudent() {
  studentConnection = mysql.createConnection(studentOptions);

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
}

async function connectTutor() {
  tutorConnection = mysql.createConnection(tutorOptions);

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
}

(async function () {
  await util.sleep(5000);
  console.log(
    "- Awaiting initial connection with user databases . (" +
      util.getCurrentDateTime() +
      ") -"
  );
  await util.sleep(15000);
  connectStudent();
  connectTutor();
})();

async function authenticateUser(userID, password, usertype) {
  if (process.env.AUTH_DISABLED == "true") {
    return { valid: true };
  }

  const studentQuery = promisify(studentConnection.query).bind(
    studentConnection
  );
  const tutorQuery = promisify(tutorConnection.query).bind(tutorConnection);

  if (usertype == "student") {
    try {
      const result = await studentQuery(
        "SELECT Password FROM Students WHERE StudentID=" + mysql.escape(userID)
      );
      if (result.length > 0) {
        if (password == result[0].Password) {
          return { valid: true };
        } else {
          return { valid: false, error: "Invalid password" };
        }
      } else {
        return { valid: false, error: "Invalid userID" };
      }
    } catch (err) {
      console.error(
        "- Query error with mysql student server. " +
          err +
          " . (" +
          util.getCurrentDateTime() +
          ") -"
      );
      connectStudent();
    }
  } else if (usertype == "tutor") {
    try {
      const result = await tutorQuery(
        "SELECT Password FROM Tutor WHERE TutorID=" + mysql.escape(userID)
      );
      if (result.length > 0) {
        if (password == result[0].Password) {
          return { valid: true };
        } else {
          return { valid: false, error: "Invalid password" };
        }
      } else {
        return { valid: false, error: "Invalid userID" };
      }
    } catch (err) {
      console.error(
        "- Query error with mysql tutor server. " +
          err +
          " . (" +
          util.getCurrentDateTime() +
          ") -"
      );
      connectTutor();
    }
  }

  return { valid: false, error: "System error" };
}

module.exports = { authenticateUser };
