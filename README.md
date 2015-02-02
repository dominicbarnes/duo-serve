duo-serve
=========

> A web server for developers using duo

## Install

```sh
$ sudo npm -g install duo-serve
```

## Usage

### CLI

```

  Usage: duo-serve [options] entries

  Options:

    -h, --help           output usage information
    -c, --copy           Turns on copy instead of symlink
    -b, --body <path>    Path to file to use as content for page
    -g, --global <name>  Export as a global with the given name
    -h, --html <path>    Path to custom handlebars template for page
    -p, --port <number>  Set the server port number
    -r, --root <path>    Set the duo root dir
    -t, --title <title>  Set the page title
    -u, --use <plugins>  Use npm modules or local files as plugins

```

### API

```js
var serve = require("duo-serve");
var handlebars = require("duo-handlebars");

serve(process.cwd())
  .title("My Duo Module")
  .entry("index.js")
  .entry("index.css")
  .use(handlebars())
  .listen(3000);
```

## Custom HTML

To start, the generated HTML should be sufficient. However, if you want to use
custom HTML, you are able to do so via the `--html` and `--body` options.

`--body` covers the contents of the `<body>` tag only, which allows you to
simply add a few tags to operate on.

If you need a fully custom page to begin with, use `--html`, which overrides
the default template used by duo-serve. The default template looks like:

```html
<!DOCTYPE html>
<html>
  <head>
    <title>{{title}}</title>
    {{#each css}}
      <link rel="stylesheet" type="text/css" href="/build/{{this}}">
    {{/each}}
  </head>
  <body>
    {{{body}}}
    {{#each js}}
      <script src="/build/{{this}}"></script>
    {{/each}}
  </body>
</html>
```

### Available params:

 * `title` the title to be used for the page (defaults to "duo-serve")
 * `css` an array of css entry files (eg: `[ "index.css" ]`)
 * `body` the contents of the file specified by `--body`
 * `js` an array of js entry files (eg: `[ "index.js" ]`)

### Notes

 * Entry files are prefixed by `/build/`, so don't forget that when outputting
   the `<link>` and `<script>` tags.
 * Body is raw HTML, so don't forget the triple-curlies (`{{{...}}}`)
