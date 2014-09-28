var fixture = require("path").join.bind(null, __dirname, "fixtures");
var glob = require("glob").sync;
var read = require("fs").readFileSync;
var request = require("supertest");
var rm = require("rimraf").sync;
var Server = require("../");

describe.only("Web Server", function () {
  var simple = Server(fixture("simple"))
    .title("my title")
    .entry("index.js")
    .entry("index.css");

  after(function () {
    glob(fixture("*/components")).forEach(function (dir) {
      rm(dir);
    });
  });

  it("should render the expected root", function (done) {
    request(simple.app)
      .get("/")
      .expect(200, read(fixture("simple/out.html"), "utf8"))
      .end(done);
  });

  it("should render the expected css", function (done) {
    request(simple.app)
      .get("/build/index.css")
      .expect(200, read(fixture("simple/build.css"), "utf8"))
      .end(done);
  });

  it("should render the expected js", function (done) {
    request(simple.app)
      .get("/build/index.js")
      .expect(200, read(fixture("simple/build.js"), "utf8"))
      .end(done);
  });

  it("should allow nested paths", function (done) {
    var s = Server(fixture("nested-paths")).entry("index.js");

    request(s.app)
      .get("/build/app/index.js")
      .expect(200)
      .end(done);
  });
});
