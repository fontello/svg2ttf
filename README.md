svg2ttf
========

[![NPM version](https://img.shields.io/npm/v/svg2ttf.svg?style=flat)](https://www.npmjs.org/package/svg2ttf)

> Converts SVG fonts to TTF format. It was initially written for
[Fontello](http://fontello.com), but you can find it useful for your projects.

__For developpers:__

Internal API is similar to FontForge's one. Since primary goal
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

### svg2ttf(svgFontString, options) -> buf

- `svgFontString` - SVG font content
- `options`
  - `copyright` - copyright string (optional)
  - `ts` - Unix timestamp (in seconds) to override creation time (optional)
  - `version` - TTF Font Version as a string formatted as 'Version x.y' or object
     - `major` - Defaults to 1
     - `minor` - Defaults to 0
     - `suffix` - Defaults to null
- `buf` - internal [byte buffer](https://github.com/fontello/microbuffer)
   object, similar to DataView. It's `buffer` property is  `Uin8Array` or `Array`
   with ttf content.

Example:

``` javascript
var fs = require('fs');
var svg2ttf = require('svg2ttf');

var ttf = svg2ttf(fs.readFileSync('myfont.svg'), {});
fs.writeFileSync('myfont.ttf', new Buffer(ttf.buffer));
```


Authors
-------

* Sergey Batishchev - [@snb2013](https://github.com/snb2013)
* Vitaly Puzrin - [@puzrin](https://github.com/puzrin)


License
-------

[MIT](https://github.com/nodeca/svg2ttf/blob/master/LICENSE).
