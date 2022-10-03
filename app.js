const express = require("express");
const createError = require("http-errors");
const path = require("path");
const logger = require("morgan");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const app = express();
const dotenv = require("dotenv").config();

app.use("/public", express.static("public"));
app.use(logger("dev"));
app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));
app.use(
  express.urlencoded({
    extended: true,
  })
);

require("./middlewares/view-mid")(app);
require("./middlewares/session-mid")(app);
require("./middlewares/locals-mid")(app);
require("./middlewares/routes-mid")(app);
require("./middlewares/error-mid")(app);

const PORT = process.env.PORT;

app.listen(PORT, function () {
  console.log(`Server running on url : http://localhost:4000`);
});
