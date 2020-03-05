svg2ttf
=======

[![Build Status](https://img.shields.io/travis/fontello/svg2ttf/master.svg?style=flat)](https://travis-ci.org/fontello/svg2ttf)
[![NPM version](https://img.shields.io/npm/v/svg2ttf.svg?style=flat)](https://www.npmjs.org/package/svg2ttf)

> Converts SVG fonts to TTF format. It was initially written for
[Fontello](http://fontello.com), but you can find it useful for your projects.

__For developpers:__

Internal API is similar to FontForge's one. Since primary goal
is generating iconic fonts, sources can lack some specific TTF/OTF features,
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
  - `description` - description string (optional)
  - `ts` - Unix timestamp (in seconds) to override creation time (optional)
  - `url` - manufacturer url (optional)
  - `version` - font version string, can be `Version x.y` or `x.y`.
- `buf` - internal [byte buffer](https://github.com/fontello/microbuffer)
   object, similar to DataView. It's `buffer` property is  `Uin8Array` or `Array`
   with ttf content.

Example:

``` javascript
var fs = require('fs');
var svg2ttf = require('svg2ttf');

var ttf = svg2ttf(fs.readFileSync('myfont.svg', 'utf8'), {});
fs.writeFileSync('myfont.ttf', new Buffer(ttf.buffer));
```


## svg2ttf for enterprise

Available as part of the Tidelift Subscription.

The maintainers of `svg2ttf` and thousands of other packages are working with Tidelift to deliver commercial support and maintenance for the open source dependencies you use to build your applications. Save time, reduce risk, and improve code health, while paying the maintainers of the exact dependencies you use. [Learn more.](https://tidelift.com/subscription/pkg/npm-svg2ttf?utm_source=npm-svg2ttf&utm_medium=referral&utm_campaign=enterprise&utm_term=repo)
