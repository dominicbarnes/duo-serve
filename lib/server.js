// dependencies
var app = require("./app.js");
var path = require("path");

// single export
module.exports = Server;

/**
 * Represents a duo-serve instance
 *
 * @param {String} root The duo root
 */
function Server(root) {
  if (!(this instanceof Server)) return new Server(root);

  this.app = app;
  this.app.set("duo root", root);
}

/**
 * Starts up the server
 *
 * @param  {Number}   port
 * @param  {Function} fn
 * @return {Server}
 */
Server.prototype.listen = function (port, fn) {
  this.app.listen(port, fn);
  return this;
};

/**
 * Sets the title for the built web page
 *
 * @param  {String} title
 * @return {Server}
 */
Server.prototype.title = function (title) {
  this.app.set("duo title", title);
  return this;
};

/**
 * Adds additional content to the built web page
 *
 * @param  {String} title
 * @return {Server}
 */
Server.prototype.body = function (body) {
  this.app.set("duo body", body);
  return this;
};

/**
 * Adds an entry file to the built web page
 *
 * @param  {String} file
 * @return {Server}
 */
Server.prototype.entry = function (file) {
  var ext = path.extname(file).slice(1);
  this.app.get("duo " + ext).push(file);
  return this;
};

/**
 * Adds multiple entry files to the built web page
 *
 * @param  {String} file
 * @return {Server}
 */
Server.prototype.entries = function (entries) {
  entries.forEach(function (entry) {
    this.entry(entry);
  }, this);
  return this;
};
