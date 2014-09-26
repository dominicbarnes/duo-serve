// dependencies
var compression = require("compression");
var duo = require("duo");
var errorhandler = require("errorhandler");
var express = require("express");
var html = require("./html.js");
var morgan = require("morgan");
var read = require("fs").readFile;
var path = require("path");

// single export
module.exports = function () {
  var app = express();

  // config specific to duo-serve
  app.set("duo root");
  app.set("duo html", null);
  app.set("duo plugins", []);
  app.set("duo title", "duo-serve");
  app.set("duo body", null);
  app.set("duo css", []);
  app.set("duo js", []);

  // additional middleware
  app.use(morgan("dev"));
  app.use(compression());
  app.use(errorhandler());

  // the generated HTML file
  app.get("/", function (req, res, next) {
    body(app.get("duo body"), function (err, body) {
      if (err) return next(err);

      html(app.get("duo html"), function (err, template) {
        if (err) return next(err);

        res.send(template({
          title: app.get("duo title"),
          body: body || null,
          css: app.get("duo css"),
          js: app.get("duo js")
        }));
      });
    });
  });

  // built entry files
  app.get("/build/:entry", function (req, res, next) {
    var entry = req.params.entry;
    var ext = path.extname(entry).slice(1);
    var build = duo(app.get("duo root"))
      .development(true)
      .cache(false)
      .entry(entry);

    app.get("duo plugins").forEach(function (fn) {
      build.use(fn);
    });

    build.run(function (err, src) {
      if (err) return next(err);
      res.type(ext).send(src);
    });
  });

  return app;
};

// simple helper for retrieving the body (if exists)
function body(file, callback) {
  if (file) {
    read(file, "utf8", callback);
  } else {
    callback();
  }
}
