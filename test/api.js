var assert = require('assert');
var Duo = require('duo');
var exists = require('fs').existsSync;
var fixture = require('path').join.bind(null, __dirname, 'fixtures');
var noop = require('nop');
var read = require('fs').readFileSync;
var rm = require('rimraf').sync;
var Server = require('../');
var vm = require('vm');

describe('API', function () {
  describe('Server', function () {
    it('should be a function', function () {
      assert.equal(typeof Server, 'function');
    });

    it('should not require the new keyword', function () {
      assert(Server() instanceof Server);
    });

    it('should set some properties', function () {
      var s = new Server();
      Object.keys(Server.defaults).forEach(function (setting) {
        var actual = s.settings[setting];
        var expected = Server.defaults[setting];
        assert.strictEqual(actual, expected, 'mismatched setting ' + setting);
      });
      assert(Array.isArray(s.plugins));
      assert.deepEqual(s.entries, {});
    });

    it('should have accessor methods', function () {
      var s = new Server();

      var methods = [
        'body', 'copy', 'favicon', 'global', 'html',
        'logging', 'root', 'title', 'token'
      ];

      methods.forEach(function (method) {
        var actual = s[method]();
        var expected = s.settings[method];
        assert.strictEqual(actual, expected, 'expected ' + method + ' accessor to work');
      });
    });

    it('should set the root when passed', function () {
      var s = new Server('test');
      assert.equal(s.root(), 'test');
    });
  });

  describe('Server#server()', function () {
    it('should return an express application', function () {
      var s = new Server('test');
      assert.equal(typeof s.server().listen, 'function');
    });
  });

  describe('Server#entry(file)', function () {
    it('should create an array for the extensions', function () {
      var s = Server().entry('index.js').entry('index.css');
      assert.deepEqual(s.entries, {
        js: [ 'index.js' ],
        css: [ 'index.css' ]
      });
    });

    it('should continue to append to the same array', function () {
      var s = Server().entry('a.js').entry('b.js');
      assert.deepEqual(s.entries, {
        js: [ 'a.js', 'b.js' ]
      });
    });

    it('should handle an array of files', function () {
      var s = Server().entry([ 'a.js', 'b.js' ]);
      assert.deepEqual(s.entries, {
        js: [ 'a.js', 'b.js' ]
      });
    });

    it('should be chainable', function () {
      var s = new Server();
      assert.strictEqual(s.entry('a.js'), s);
    });
  });

  describe('Server#use(plugin)', function () {
    it('should append to the plugins array', function () {
      var s = new Server().use(noop);
      assert.deepEqual(s.plugins, [ noop ]);
    });

    it('should accept an array of plugins', function () {
      var s = new Server();
      s.use([ noop, noop, noop ]);
      assert.deepEqual(s.plugins, [ noop, noop, noop ]);
    });

    it('should be chainable', function () {
      var s = new Server();
      assert.strictEqual(s.use(noop), s);
    });
  });

  describe('Server#getTemplate(callback)', function () {
    it('should pass a smoke test', function (done) {
      Server().getTemplate(done);
    });

    it('should read the default template', function (done) {
      Server().getTemplate(function (err, template) {
        if (err) return done(err);
        assert.equal(template(), read(fixture('empty-render/out.html'), 'utf8'));
        done();
      });
    });

    it('should read a custom template', function (done) {
      var s = new Server();
      s.html(fixture('custom-template/index.hbs'));
      s.getTemplate(function (err, template) {
        if (err) return done(err);
        assert.equal(template(), read(fixture('custom-template/out.html')));
        done();
      });
    });

    it('should use the proper context for success', function (done) {
      var s = new Server();
      s.getTemplate(function (err, template) {
        if (err) return done(err);
        assert(template);
        assert.strictEqual(this, s);
        done();
      });
    });

    it('should use the proper context for errors', function (done) {
      var s = Server();
      s.html('does-not-exist');
      s.getTemplate(function (err) {
        assert(err);
        assert.strictEqual(this, s);
        done();
      });
    });

    it('should be chainable', function (done) {
      var s = new Server();
      assert.strictEqual(s, s.getTemplate(done));
    });
  });

  describe('Server#getBody(callback)', function () {
    it('should pass a smoke test', function (done) {
      Server().getBody(done);
    });

    it('should return nothing by default', function (done) {
      Server().getBody(function (err, body) {
        if (err) return done(err);
        assert(!body);
        done();
      });
    });

    it('should allow a function to be used', function (done) {
      var s = new Server();
      s.body(function (done) {
        process.nextTick(function () {
          done(null, 'body');
        });
      });
      s.getBody(function (err, body) {
        if (err) return done(err);
        assert.equal(body, 'body');
        done();
      });
    });

    it('should return the given file', function (done) {
      var s = new Server();
      s.body(fixture('custom-template/index.hbs'));
      s.getBody(function (err, body) {
        if (err) return done(err);
        assert.equal(body, read(fixture('custom-template/out.html'), 'utf8'));
        done();
      });
    });

    it('should use the proper context for success', function (done) {
      var s = new Server();
      s.getBody(function (err) {
        if (err) return done(err);
        assert.strictEqual(this, s);
        done();
      });
    });

    it('should use the proper context for errors', function (done) {
      var s = Server();
      s.body('does-not-exist');
      s.getBody(function (err) {
        assert(err);
        assert.strictEqual(this, s);
        done();
      });
    });

    it('should be chainable', function (done) {
      var s = new Server();
      assert.strictEqual(s, s.getBody(done));
    });
  });

  describe('Server#render(base, callback)', function () {
    it('should render basic html', function (done) {
      Server()
        .title('my title')
        .entry('index.js')
        .entry('index.css')
        .render('/build/', function (err, html) {
          if (err) return done(err);
          assert.equal(html, read(fixture('simple/out.html'), 'utf8'));
          done();
        });
    });

    it('should use the proper context for success', function (done) {
      var s = new Server();

      s.render('/build/', function (err) {
        if (err) return done(err);
        assert.strictEqual(this, s);
        done();
      });
    });

    it('should use the proper context for html error', function (done) {
      var s = new Server();
      s.html('does-not-exist');
      s.render('/build/', function (err) {
        assert(err);
        assert.strictEqual(this, s);
        done();
      });
    });

    it('should use the proper context for body error', function (done) {
      var s = new Server();
      s.body('does-not-exist');
      s.render('/build/', function (err) {
        assert(err);
        assert.strictEqual(this, s);
        done();
      });
    });

    it('should be chainable', function (done) {
      var s = new Server();
      assert.strictEqual(s, s.render('/build/', done));
    });
  });

  describe('Server#build(entry)', function () {
    it('should render the file via duo', function (done) {
      var s = new Server(fixture('simple'));
      s.build('index.js').run(function (err, src) {
        if (err) return done(err);
        assert.strictEqual(vm.runInNewContext(src.code)(1), true);
        done();
      });
    });

    it('should return the duo builder instance', function () {
      var s = new Server(fixture('simple'));
      assert(s.build('index.css') instanceof Duo);
    });

    it('should turn on development mode', function () {
      var s = new Server(fixture('simple'));
      var duo = s.build('index.css');
      assert.strictEqual(duo.development(), true);
    });

    it('should set the duo global', function () {
      var s = new Server(fixture('simple'));
      s.global('test');
      var duo = s.build('index.js');
      assert.strictEqual(duo.global(), 'test');
    });

    it('should switch the copy flag', function () {
      var s = new Server(fixture('simple'));
      s.copy(true);
      var duo = s.build('index.js');
      assert.strictEqual(duo.copy(), true);
    });
  });

  describe('Server#buildTo(destination, callback)', function () {
    var s = new Server(fixture('build-to')).entry([ 'index.js', 'index.css' ]);

    before(function (done) {
      this.timeout('5s');
      s.buildTo('output', done);
    });

    after(function () {
      rm(fixture('build-to/components'));
      rm(fixture('build-to/output'));
    });

    it('should create the destination directory', function () {
      assert(exists(fixture('build-to/output')));
    });

    it('should render the html to the destination directory', function () {
      var actual = read(fixture('build-to/output/index.html'), 'utf8');
      var expected = read(fixture('build-to/out.html'), 'utf8');
      assert.equal(actual.trim(), expected.trim());
    });

    it('should render the js to the destination directory', function () {
      var actual = read(fixture('build-to/output/index.js'), 'utf8');
      var expected = read(fixture('build-to/build.js'), 'utf8');
      assert.equal(actual.trim(), expected.trim());
    });

    it('should render the js map to the destination directory', function () {
      var actual = read(fixture('build-to/output/index.js.map'), 'utf8');
      var expected = read(fixture('build-to/build.js.map'), 'utf8');
      assert.equal(actual.trim(), expected.trim());
    });

    it('should render the css to the destination directory', function () {
      var actual = read(fixture('build-to/output/index.css'), 'utf8');
      var expected = read(fixture('build-to/build.css'), 'utf8');
      assert.equal(actual.trim(), expected.trim());
    });

    it('should copy assets to the destination directory', function () {
      assert(exists(fixture('build-to/output/duo.png')));
    });

    it('should copy assets from components to the destination directory', function () {
      assert(exists(fixture('build-to/output/components/typefaces-source-code-black@master/fonts/source-code-black.eot')));
    });
  });
});
