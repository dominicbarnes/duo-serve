// dependencies
var compression = require("compression");
var duo = require("duo");
var errorhandler = require("errorhandler");
var express = require("express");
var html = require("./html.js");
var morgan = require("morgan");
var path = require("path");

// single export
module.exports = function () {
  var app = express();

  // config specific to duo-serve
  app.set("duo root");
  app.set("duo title", "duo-serve");
  app.set("duo body", null);
  app.set("duo css", []);
  app.set("duo js", []);

  // additional middleware
  app.use(morgan("dev"));
  app.use(compression());
  app.use(errorhandler());

  // the generated HTML file
  app.get("/", function (req, res) {
    res.send(html({
      title: app.get("duo title"),
      body: app.get("duo body"),
      css: app.get("duo css"),
      js: app.get("duo js")
    }));
  });

  // built entry files
  app.get("/build/:entry", function (req, res, next) {
    var entry = req.params.entry;
    var ext = path.extname(entry).slice(1);

    duo(app.get("duo root"))
      .entry(entry)
      .run(function (err, src) {
        if (err) return next(err);

        res.type(ext);
        res.send(src);
      });
  });

  return app;
};
