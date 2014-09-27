// dependencies
var app = require("./app.js");
var debug = require("debug")("duo-serve");
var express = require("express");
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

  debug("initializing new server for root: %s", root);

  this.app = app()
    .set("duo root", root)
    .use("/build", express.static(path.join(root, "build")));
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
 * Sets a custom template for the index.html
 *
 * @param  {String} path
 * @return {Server}
 */
Server.prototype.html = function (path) {
  debug("setting html template path as %s", path);
  this.app.set("duo html", path);
  return this;
};


/**
 * Sets the title for the built web page
 *
 * @param  {String} title
 * @return {Server}
 */
Server.prototype.title = function (title) {
  debug("setting title as %s", title);
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
  debug("setting body of length %d", body.length);
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
  debug("adding entry file %s", file);
  var ext = path.extname(file).slice(1);
  this.app.get("duo " + ext).push(file);
  return this;
};

Server.prototype.global = function (name) {
  debug("using global name %s", name);
  this.app.set("duo global", name);
  return this;
};

/**
 * Adds multiple entry files to the built web page
 *
 * @param  {String} file
 * @return {Server}
 */
Server.prototype.entries = function (entries) {
  entries.forEach(this.entry.bind(this));
  return this;
};

/**
 * Adds a duo plugin
 *
 * @param  {Function} plugin
 * @return {Server}
 */
Server.prototype.use = function (plugin) {
  debug("adding plugin %s", plugin.name);
  this.app.get("duo plugins").push(plugin);
  return this;
};
