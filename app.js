var express = require("express");
var path = require("path");
var routes = require("./routes");
var app = express();
var bodyParser = require("body-parser");

app.use(bodyParser.urlencoded({ extended: false }));
var session = require("express-session");
app.use(
    session({
        secret: "mySecretKey",
        resave: false,
        saveUninitialized: true,
    })
);

app.use(routes);

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "hbs");

var publicDir = require("path").join(__dirname, "/public");
app.use(express.static(publicDir));

app.set("port", process.env.PORT || 3000);
app.listen(app.get("port"), function() {
    console.log("Server starts on port " + app.get("port"));
});