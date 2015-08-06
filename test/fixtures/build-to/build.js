(function outer(modules, cache, entries){

  /**
   * Global
   */

  var global = (function(){ return this; })();

  /**
   * Require `name`.
   *
   * @param {String} name
   * @api public
   */

  function require(name){
    if (cache[name]) return cache[name].exports;
    if (modules[name]) return call(name, require);
    throw new Error('cannot find module "' + name + '"');
  }

  /**
   * Call module `id` and cache it.
   *
   * @param {Number} id
   * @param {Function} require
   * @return {Function}
   * @api private
   */

  function call(id, require){
    var m = cache[id] = { exports: {} };
    var mod = modules[id];
    var name = mod[2];
    var fn = mod[0];
    var threw = true;

    try {
      fn.call(m.exports, function(req){
        var dep = modules[id][1][req];
        return require(dep || req);
      }, m, m.exports, outer, modules, cache, entries);
      threw = false;
    } finally {
      if (threw) {
        delete cache[id];
      } else if (name) {
        // expose as 'name'.
        cache[name] = cache[id];
      }
    }

    return cache[id].exports;
  }

  /**
   * Require all entries exposing them on global if needed.
   */

  for (var id in entries) {
    if (entries[id]) {
      global[entries[id]] = require(id);
    } else {
      require(id);
    }
  }

  /**
   * Duo flag.
   */

  require.duo = true;

  /**
   * Expose cache.
   */

  require.cache = cache;

  /**
   * Expose modules
   */

  require.modules = modules;

  /**
   * Return newest require.
   */

   return require;
})({
1: [function(require, module, exports) {
module.exports = true;

}, {}]}, {}, {"1":""})

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9yZXF1aXJlLmpzIiwiL2luZGV4LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzFGQTtBQUNBIiwiZmlsZSI6ImluZGV4LmpzIiwic291cmNlUm9vdCI6Ii9kdW8iLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gb3V0ZXIobW9kdWxlcywgY2FjaGUsIGVudHJpZXMpe1xuXG4gIC8qKlxuICAgKiBHbG9iYWxcbiAgICovXG5cbiAgdmFyIGdsb2JhbCA9IChmdW5jdGlvbigpeyByZXR1cm4gdGhpczsgfSkoKTtcblxuICAvKipcbiAgICogUmVxdWlyZSBgbmFtZWAuXG4gICAqXG4gICAqIEBwYXJhbSB7U3RyaW5nfSBuYW1lXG4gICAqIEBhcGkgcHVibGljXG4gICAqL1xuXG4gIGZ1bmN0aW9uIHJlcXVpcmUobmFtZSl7XG4gICAgaWYgKGNhY2hlW25hbWVdKSByZXR1cm4gY2FjaGVbbmFtZV0uZXhwb3J0cztcbiAgICBpZiAobW9kdWxlc1tuYW1lXSkgcmV0dXJuIGNhbGwobmFtZSwgcmVxdWlyZSk7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdjYW5ub3QgZmluZCBtb2R1bGUgXCInICsgbmFtZSArICdcIicpO1xuICB9XG5cbiAgLyoqXG4gICAqIENhbGwgbW9kdWxlIGBpZGAgYW5kIGNhY2hlIGl0LlxuICAgKlxuICAgKiBAcGFyYW0ge051bWJlcn0gaWRcbiAgICogQHBhcmFtIHtGdW5jdGlvbn0gcmVxdWlyZVxuICAgKiBAcmV0dXJuIHtGdW5jdGlvbn1cbiAgICogQGFwaSBwcml2YXRlXG4gICAqL1xuXG4gIGZ1bmN0aW9uIGNhbGwoaWQsIHJlcXVpcmUpe1xuICAgIHZhciBtID0gY2FjaGVbaWRdID0geyBleHBvcnRzOiB7fSB9O1xuICAgIHZhciBtb2QgPSBtb2R1bGVzW2lkXTtcbiAgICB2YXIgbmFtZSA9IG1vZFsyXTtcbiAgICB2YXIgZm4gPSBtb2RbMF07XG4gICAgdmFyIHRocmV3ID0gdHJ1ZTtcblxuICAgIHRyeSB7XG4gICAgICBmbi5jYWxsKG0uZXhwb3J0cywgZnVuY3Rpb24ocmVxKXtcbiAgICAgICAgdmFyIGRlcCA9IG1vZHVsZXNbaWRdWzFdW3JlcV07XG4gICAgICAgIHJldHVybiByZXF1aXJlKGRlcCB8fCByZXEpO1xuICAgICAgfSwgbSwgbS5leHBvcnRzLCBvdXRlciwgbW9kdWxlcywgY2FjaGUsIGVudHJpZXMpO1xuICAgICAgdGhyZXcgPSBmYWxzZTtcbiAgICB9IGZpbmFsbHkge1xuICAgICAgaWYgKHRocmV3KSB7XG4gICAgICAgIGRlbGV0ZSBjYWNoZVtpZF07XG4gICAgICB9IGVsc2UgaWYgKG5hbWUpIHtcbiAgICAgICAgLy8gZXhwb3NlIGFzICduYW1lJy5cbiAgICAgICAgY2FjaGVbbmFtZV0gPSBjYWNoZVtpZF07XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIGNhY2hlW2lkXS5leHBvcnRzO1xuICB9XG5cbiAgLyoqXG4gICAqIFJlcXVpcmUgYWxsIGVudHJpZXMgZXhwb3NpbmcgdGhlbSBvbiBnbG9iYWwgaWYgbmVlZGVkLlxuICAgKi9cblxuICBmb3IgKHZhciBpZCBpbiBlbnRyaWVzKSB7XG4gICAgaWYgKGVudHJpZXNbaWRdKSB7XG4gICAgICBnbG9iYWxbZW50cmllc1tpZF1dID0gcmVxdWlyZShpZCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJlcXVpcmUoaWQpO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBEdW8gZmxhZy5cbiAgICovXG5cbiAgcmVxdWlyZS5kdW8gPSB0cnVlO1xuXG4gIC8qKlxuICAgKiBFeHBvc2UgY2FjaGUuXG4gICAqL1xuXG4gIHJlcXVpcmUuY2FjaGUgPSBjYWNoZTtcblxuICAvKipcbiAgICogRXhwb3NlIG1vZHVsZXNcbiAgICovXG5cbiAgcmVxdWlyZS5tb2R1bGVzID0gbW9kdWxlcztcblxuICAvKipcbiAgICogUmV0dXJuIG5ld2VzdCByZXF1aXJlLlxuICAgKi9cblxuICAgcmV0dXJuIHJlcXVpcmU7XG59KSIsIm1vZHVsZS5leHBvcnRzID0gdHJ1ZTtcbiJdfQ==