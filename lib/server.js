// dependencies
var compression = require("compression");
var defaults = require("defaults");
var delegate = require("delegates");
var duo = require("duo");
var errorhandler = require("errorhandler");
var express = require("express");
var fs = require("fs");
var Handlebars = require("handlebars");
var morgan = require("morgan");
var path = require("path");

// single export
module.exports = Server;

/**
 * Represents a duo-serve instance
 *
 * @param {String} root
 */
function Server(root) {
  if (!(this instanceof Server)) return new Server(root);

  this.settings = defaults({}, Server.defaults);
  if (root) this.root(root);
  this.plugins = [];
  this.entries = {};

  this.app = express()
    .use(morgan("dev"))
    .use(compression())
    .use(errorhandler())
    .get("/", this.handleRender.bind(this))
    .get("/build/*", this.handleBuild.bind(this));
}

// defaults
Server.defaults = {
  body: false,
  global: false,
  html: path.join(__dirname, "build.hbs"),
  root: process.cwd(),
  title: "duo-serve"
};

// configuration
delegate(Server.prototype, "settings")
  .fluent("body")
  .fluent("global")
  .fluent("html")
  .fluent("root")
  .fluent("title");

// express methods
delegate(Server.prototype, "app")
  .method("listen");

/**
 * Adds an entry file to the built web page
 *
 * @param  {String} file
 * @return {Server}
 */
Server.prototype.entry = function (file) {
  if (Array.isArray(file)) {
    file.forEach(this.entry.bind(this));
  } else {
    var ext = path.extname(file).slice(1);
    if (!this.entries[ext]) this.entries[ext] = [];
    this.entries[ext].push(file);
  }

  return this;
};

/**
 * Adds a duo plugin
 *
 * @param  {Function} plugin
 * @return {Server}
 */
Server.prototype.use = function (plugin) {
  if (Array.isArray(plugin)) {
    plugin.forEach(this.use.bind(this));
  } else {
    this.plugins.push(plugin);
  }

  return this;
};

/**
 * Retrieve the template to be used for the page
 *
 * @param {Function} callback
 */
Server.prototype.getTemplate = function (callback) {
  callback = callback.bind(this);
  fs.readFile(this.html(), "utf8", function (err, contents) {
    if (err) return callback(err);
    callback(null, Handlebars.compile(contents));
  });
  return this;
};

/**
 * Retrieve the template to be used for the page
 *
 * @param {Function} callback
 */
Server.prototype.getBody = function (callback) {
  var body = this.body();
  if (!body) {
    callback.call(this);
  } else {
    fs.readFile(body, "utf8", callback.bind(this));
  }
  return this;
};

/**
 * Renders the main template
 *
 * @param {Function} callback
 */
Server.prototype.render = function (callback) {
  callback = callback.bind(this);

  this.getTemplate(function (err, template) {
    if (err) return callback(err);

    this.getBody(function (err, body) {
      if (err) return callback(err);

      callback(null, template({
        body: body,
        css: this.entries.css,
        js: this.entries.js,
        title: this.title()
      }));
    });
  });

  return this;
};

/**
 * Uses duo to build the given entry file
 *
 * @param {String}   entry
 * @param {Function} callback
 */
Server.prototype.build = function (entry, callback) {
  var build = duo(this.root())
    .development(true)
    .cache(false)
    .entry(entry);

  var global = this.global();
  if (global) build.global(global);

  this.plugins.forEach(function (fn) {
    build.use(fn);
  });

  build.run(callback);

  return build;
};

/**
 * Route handler to render the HTML page
 *
 * @param {express.Request} req
 * @param {express.Response} res
 * @param {Function} next
 */
Server.prototype.handleRender = function (req, res, next) {
  this.render(function (err, html) {
    if (err) return next(err);
    res.send(html);
  });
};

/**
 * Route handler to render an entry file via duo
 *
 * @param {express.Request} req
 * @param {express.Response} res
 * @param {Function} next
 */
Server.prototype.handleBuild = function (req, res, next) {
  var entry = req.url.slice(7);
  var ext = path.extname(entry).slice(1);

  this.build(entry, function (err, src) {
    if (err) return next(err);
    res.type(ext).send(src);
  });
};
