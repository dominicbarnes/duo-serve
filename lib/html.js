// dependencies
var fs = require("fs");
var Handlebars = require("handlebars");
var path = require("path");
var def = path.join(__dirname, "build.hbs");

// single export
module.exports = function (file, callback) {
  fs.readFile(file || def, "utf8", function (err, contents) {
    if (err) return callback(err);
    callback(null, Handlebars.compile(contents));
  });
};
