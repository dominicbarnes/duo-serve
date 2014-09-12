// dependencies
var Handlebars = require("handlebars");
var path = require("path");
var read = require("fs").readFileSync;
var html = read(path.join(__dirname, "build.hbs"), "utf8");

// single export
module.exports = Handlebars.compile(html);
