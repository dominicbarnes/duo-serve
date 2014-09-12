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
    -b, --body <path>    HTML content for the page (in a file)
    -p, --port <number>  Set the server port number
    -r, --root <path>    Set the duo root dir
    -t, --title <title>  Set the page title

```

### API

```js
var serve = require("duo-serve");

serve(process.cwd())
  .title("My Duo Module")
  .entry("index.js")
  .entry("index.css")
  .listen(3000);
```
