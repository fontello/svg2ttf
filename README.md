svg2ttf
========

svg2ttf converts SVG graphics to TTF format. That can be useful for different
webfont generation tools.

Usaging from CLI
----------------

Install:

``` bash
npm install -g svg2ttf
```

Usage example:

``` bash
svg2ttf fontello.svg fontello.ttf
```

API
---

We use [jDataView](https://github.com/fontello/svg2ttf) to work with binary buffers.
That's universal abstraction layer for both node.js & browser.

### svg2ttf(svgFontString, options) -> buf

- `svgFontString` - SVG font content
- `options` - not used yet
- `buf` - jDataView with ttf's content

Example:

``` javascript
var fs = require('fs');
var svg2ttf = require('svg2ttf');

var ttf = svg2ttf(fs.readFileSync('myfont.svg'));
fs.writeFileSync('myfont.ttf', ttf.buffer);
```

Authors
-------

* Sergey Batishchev - [@snb2013](https://github.com/snb2013)
* Vitaly Puzrin - [@puzrin](https://github.com/puzrin)


License
-------

Copyright (c) 2013 [Vitaly Puzrin](https://github.com/puzrin).
Released under the MIT license. See
[LICENSE](https://github.com/nodeca/svg2ttf/blob/master/LICENSE) for details.

