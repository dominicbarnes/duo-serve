// dependencies
var Batch = require('batch');
var compression = require('compression');
var defaults = require('defaults');
var delegate = require('delegates');
var duo = require('duo');
var errorhandler = require('errorhandler');
var express = require('express');
var favicon = require('serve-favicon');
var fs = require('fs');
var Handlebars = require('handlebars');
var mkdirp = require('mkdirp');
var morgan = require('morgan');
var netrc = require('node-netrc');
var path = require('path');
var serveStatic = require('serve-static');

// single export
module.exports = Server;

/**
 * Represents a duo-serve instance
 *
 * @constructor
 * @param {String} root  The project root
 */
function Server(root) {
  if (!(this instanceof Server)) return new Server(root);

  this.settings = defaults({}, Server.defaults);
  if (root) this.root(root);
  this.plugins = [];
  this.entries = {};

  var auth = netrc('api.github.com');
  if ('GH_TOKEN' in process.env) this.token(process.env.GH_TOKEN);
  else if (auth.password) this.token(auth.password);
}

// defaults
Server.defaults = {
  body: false,
  cache: true,
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
  .fluent('cache')
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
 * @returns {express.Application}  The generated Express app.
 */
Server.prototype.server = function () {
  var app = express();
  var icon = this.favicon();
  var logging = this.logging();

  if (icon) app.use(favicon(icon));
  if (logging) app.use(morgan(logging));
  app.use(compression());
  app.use(errorhandler());
  app.get('/build/*', this.handleBuild.bind(this));
  app.use('/build', serveStatic(this.root()));
  app.get('*', this.handleRender.bind(this));

  return app;
};

/**
 * Generates an express app and starts listening. (primarilly here for
 * backwards-compatibility)
 *
 * @param {Number} port            The port number to listen on.
 * @param {Function} callback      Called after server has started.
 * @returns {express.Application}  The generated Express app.
 */
Server.prototype.listen = function (port, callback) {
  var app = this.server();
  app.listen(port, callback);
  return app;
};

/**
 * Adds an entry file to the built web page
 *
 * @param  {String|Array} file  The relative path to the entry file.
 * @return {Server}             Chainable.
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
 * @private
 * @param {String} file  The entry file to check for.
 * @returns {Boolean}    Whether or not the entry has been included.
 */
Server.prototype.hasEntry = function (file) {
  var ext = path.extname(file).slice(1);
  if (!(ext in this.entries)) return false;
  return this.entries[ext].indexOf(file) > -1;
};

/**
 * Adds a duo plugin
 *
 * @param  {Function|Array} plugin  The plugin fn.
 * @return {Server}                 Chainable.
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
 * @private
 * @param {Function} callback  Fired after retrieving the template.
 * @returns {Server}           Chainable.
 */
Server.prototype.getTemplate = function (callback) {
  var fn = callback.bind(this);
  fs.readFile(this.html(), 'utf8', function (err, contents) {
    if (err) return fn(err);
    fn(null, Handlebars.compile(contents));
  });
  return this;
};

/**
 * Retrieve the template to be used for the page
 *
 * @private
 * @param {Function} callback  Called after retrieving the body contents.
 * @returns {Server}           Chainable.
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
 * @private
 * @param {String} base        The base URL to use for the entry assets.
 * @param {Function} callback  Called after rendering the HTML string.
 * @returns {Server}           Chainable.
 */
Server.prototype.render = function (base, callback) {
  var fn = callback.bind(this);

  this.getTemplate(function (err, template) {
    if (err) return fn(err);

    this.getBody(function (err, body) {
      if (err) return fn(err);

      fn(null, template({
        base: base,
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
 * @private
 * @param {String} entry              The entry file to build.
 * @param {String|Boolean} sourceMap  The source-map mode to use.
 * @param {Function} callback         Called after building the entry file.
 * @returns {Duo}                     The generated Duo instance.
 */
Server.prototype.build = function (entry, sourceMap, callback) {
  var build = duo(this.root())
    .development(true)
    .sourceMap(sourceMap)
    .token(this.token())
    .cache(this.cache())
    .entry(entry);

  var global = this.global();
  if (global) build.global(global);

  var copy = this.copy();
  if (typeof copy !== 'undefined') build.copy(copy);

  build.use(this.plugins);

  build.run(callback);

  return build;
};

/**
 * Takes the given configuration and builds it into a static site.
 * (after developing in the server, you can jump straight to using
 * it as a static site)
 *
 * @param {String} destination  The output directory. (relative to root)
 * @param {Function} callback   Called after the build has completed.
 * @returns {Batch}             The Batch instance used.
 */
Server.prototype.buildTo = function (destination, callback) {
  var self = this;
  var batch = new Batch();
  var root = this.root();

  // TODO: favicon

  batch.push(function (done) {
    self.render('', function (err, html) {
      if (err) return done(err);
      var dest = path.resolve(root, destination, 'index.html');
      write(dest, html, done);
    });
  });

  var entries = this.entries.js.concat(this.entries.css);

  // TODO: other types of entries (is there a use-case for this?)

  entries.forEach(function (entry) {
    batch.push(function (done) {
      self.build(entry, true, function (err, results) {
        if (err) return done(err);
        var dest = path.resolve(root, destination, entry);
        write(dest, results.code, function (err) {
          if (err) {
            done(err);
          } else if (results.map) {
            write(dest + '.map', results.map, done);
          } else {
            done();
          }
        });
      });
    });
  });

  // TODO: pass along some results?

  return batch.end(callback);
};

/**
 * Route handler to render the HTML page
 *
 * @private
 * @param {express.Request} req   The request object.
 * @param {express.Response} res  The response object.
 * @param {Function} next         The next middleware handler.
 * @returns {undefined}           No return value.
 */
Server.prototype.handleRender = function (req, res, next) {
  this.render('/build/', function (err, html) {
    if (err) return next(err);
    res.send(html);
  });
};

/**
 * Route handler to render an entry file via duo
 *
 * @private
 * @param {express.Request} req   The request object.
 * @param {express.Response} res  The response object.
 * @param {Function} next         The next middleware handler.
 * @returns {undefined}           No return value.
 */
Server.prototype.handleBuild = function (req, res, next) {
  var entry = req.url.slice(7);
  var ext = path.extname(entry).slice(1);

  // static assets should bypass this and move onto the static middleware
  if (!this.hasEntry(entry)) return next();

  // build dynamically via duo
  this.build(entry, 'inline', function (err, src) {
    if (err) return next(err);
    res.type(ext).send(src.code);
  });
};


// private helpers

function write(file, body, callback) {
  mkdirp(path.dirname(file), function (err) {
    if (err) return callback(err);
    fs.writeFile(file, body, 'utf8', callback);
  });
}
