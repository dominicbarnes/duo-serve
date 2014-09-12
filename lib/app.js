// dependencies
var duo = require("duo");
var express = require("express");
var html = require("./html.js");
var path = require("path");

// single export
var app = module.exports = express();

// config specific to duo-serve
app.set("duo root");
app.set("duo title", "duo-serve");
app.set("duo body", null);
app.set("duo css", []);
app.set("duo js", []);

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
