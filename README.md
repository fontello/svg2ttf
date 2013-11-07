svg2ttf
========

svg2ttf converts SVG graphics to TTF format. It was written for
[Fontello](http://fontello.com), but you can find it useful for your projects.

For developpers: internal API is similar to FontForge's one. Since primary goal
is generating iconic fonts, sources can lack some spesific TTF/OTF features,
like kerning and so on. Anyway, current code is a good base for development,
because it will save you tons of hours to implement correct writing & optimizing
TTF tables.


Using from CLI
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

We use [jDataView](https://github.com/jDataView/jDataView) to work with binary buffers.
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
fs.writeFileSync('myfont.ttf', new Buffer(ttf.buffer));
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

