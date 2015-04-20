// dependencies
var compression = require('compression');
var defaults = require('defaults');
var delegate = require('delegates');
var duo = require('duo');
var errorhandler = require('errorhandler');
var express = require('express');
var favicon = require('serve-favicon');
var fs = require('fs');
var Handlebars = require('handlebars');
var morgan = require('morgan');
var netrc = require('node-netrc');
var path = require('path');
var serveStatic = require('serve-static');

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

  var auth = netrc('api.github.com');
  if (auth.password) this.token(auth.password);
}

// defaults
Server.defaults = {
  body: false,
  favicon: path.resolve(__dirname, '../public/duo.png'),
  global: false,
  html: path.join(__dirname, 'build.hbs'),
  logging: 'dev',
  root: process.cwd(),
  title: 'duo-serve'
};

// configuration
delegate(Server.prototype, 'settings')
  .fluent('body')
  .fluent('copy')
  .fluent('favicon')
  .fluent('global')
  .fluent('html')
  .fluent('logging')
  .fluent('root')
  .fluent('title')
  .fluent('token');

/**
 * Generates the underlying express app.
 *
 * @returns {express.Application}
 */

Server.prototype.server = function () {
  var app = express();
  var icon = this.favicon();
  var logging = this.logging();

  if (icon) app.use(favicon(icon));
  if (logging) app.use(morgan(logging));
  app.use(compression());
  app.use(errorhandler());
  app.get('/', this.handleRender.bind(this));
  app.get('/build/*', this.handleBuild.bind(this));
  app.use('/build', serveStatic(this.root()));

  return app;
};

/**
 * Generates an express app and starts listening. (primarilly here for
 * backwards-compatibility)
 *
 * @param {Number} port
 * @param {Function} callback
 * @returns {express.Application}
 */

Server.prototype.listen = function (port, callback) {
  var app = this.server();
  app.listen(port, callback);
  return app;
};

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
 * Checks for if the input file is a registered entry file
 *
 * @api private
 * @param {String} file
 * @returns {Boolean}
 */
Server.prototype.hasEntry = function (file) {
  var ext = path.extname(file).slice(1);
  if (!(ext in this.entries)) return false;
  return this.entries[ext].indexOf(file) > -1;
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
 * @api private
 * @param {Function} callback
 */
Server.prototype.getTemplate = function (callback) {
  callback = callback.bind(this);
  fs.readFile(this.html(), 'utf8', function (err, contents) {
    if (err) return callback(err);
    callback(null, Handlebars.compile(contents));
  });
  return this;
};

/**
 * Retrieve the template to be used for the page
 *
 * @api private
 * @param {Function} callback
 */
Server.prototype.getBody = function (callback) {
  var body = this.body();
  if (!body) {
    callback.call(this);
  } else if (typeof body === 'function') {
    body.call(this, callback.bind(this));
  } else {
    fs.readFile(body, 'utf8', callback.bind(this));
  }
  return this;
};

/**
 * Renders the main template
 *
 * @api private
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
 * @api private
 * @param {String}   entry
 * @param {Function} callback
 */
Server.prototype.build = function (entry, callback) {
  var build = duo(this.root())
    .development(true)
    .sourceMap('inline')
    .token(this.token())
    .cache(false)
    .entry(entry);

  var global = this.global();
  if (global) build.global(global);

  var copy = this.copy();
  if (typeof copy !== 'undefined') build.copy(copy);

  build.use(this.plugins);

  build.run(function (err, results) {
    if (err) return callback(err);
    callback(null, results.code);
  });

  return build;
};

/**
 * Route handler to render the HTML page
 *
 * @api private
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
 * @api private
 * @param {express.Request} req
 * @param {express.Response} res
 * @param {Function} next
 */
Server.prototype.handleBuild = function (req, res, next) {
  var entry = req.url.slice(7);
  var ext = path.extname(entry).slice(1);

  // static assets should bypass this and move onto the static middleware
  if (!this.hasEntry(entry)) return next();

  // build dynamically via duo
  this.build(entry, function (err, src) {
    if (err) return next(err);
    res.type(ext).send(src);
  });
};
