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

module.exports = { getCurrentDateTime };
