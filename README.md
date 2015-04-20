duo-serve
=========

> A web server for developers using duo

## Install

```sh
$ sudo npm -g install duo-serve
```

## CLI

```

  Usage: duo-serve [options] <entries...>

  Options:

    -h, --help           output usage information
    -b, --body <path>    Path to file to use as content for page
    -c, --copy           Turns on copy instead of symlink
    -g, --global <name>  Export as a global with the given name
    -h, --html <path>    Path to custom handlebars template for page
    -p, --port <number>  Set the server port number
    -r, --root <path>    Set the duo root dir
    -t, --title <title>  Set the page title
    -T, --token <token>  Set the GitHub API token (default uses ~/.netrc)
    -u, --use <plugins>  Use npm modules or local files as plugins

```

## API

```js
var serve = require('duo-serve');
var handlebars = require('duo-handlebars');

serve(process.cwd())
  .title('My Duo Module')
  .entry('index.js')
  .entry('index.css')
  .use(handlebars())
  .listen(3000);
```

### Server(root)

Creates a new instance (with or without `new`) of a duo server. The `root`
parameter will set the root used by duo. (defaults to `process.cwd()`)

### Server#body([value])

Gets/sets the string content of the `<body>` tag on the generated HTML page.

### Server#copy([value])

Gets/sets the boolean value to be passed into `Duo#copy()`.

### Server#entry([file])

Adds an entry file (relative to the configured `root`) that will be processed
by duo and served to the generated HTML page.

The `file` argument can also be an array of filenames.

### Server#favicon([value])

Gets/sets the path to the image file to be used as the favicon. By default,
this will use the duo triangle logo. Passing a string path here will override
that, and `false` will disable the favicon middleware altogether.

### Server#global([value])

Gets/sets the name of the global variable that duo will use when processing
the given entry files. (only works with a single JS entry file)

### Server#html([value])

Gets/sets the path to the Handlebars template that is used to generate the HTML
page.

### Server#listen([port], [callback])

Generates an express app using `Server#server()` and passes the arguments to
it's `listen()` method. This method will return the express app.

### Server#logging([value])

Gets/sets the argument to be passed to the
[morgan](https://github.com/expressjs/morgan) middleware. The default value
is "dev", but passing `false` explicitly will disable logging.

### Server#root([value])

Gets/sets the root directory that duo uses for processing.

### Server#server()

A factory method for an express server matching all the available configuration.
Use this method when you need to augment the express app any further.

### Server#title([value])

Gets/sets the title of the generated HTML page.

### Server#token([value])

Gets/sets the GitHub API token that duo will use.

### Server#use([plugin])

Adds a duo plugin that will be used when processing the entry files.


## Custom HTML

To start, the generated HTML should be sufficient. However, if you want to use
custom HTML, you are able to do so via the `html` and `body` options.

`body` covers the contents of the `<body>` tag only, which allows you to
simply add a few tags to operate on.

If you need a fully custom page to begin with, use `html`, which overrides
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
