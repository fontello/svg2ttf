/*
 Author: Sergey Batishchev <snb2003@rambler.ru>

 Written for fontello.com project.

 TTF file structure is based on https://developer.apple.com/fonts/TTRefMan/RM06/Chap6.html
 */

'use strict';

var _ = require('lodash');
var svg_font = require("./lib/svg_font");
var ttfFont = require("./lib/ttf_utils");
var TTF = require("./lib/ttf");

//------------------main---------------------------------

function svg2ttf(svg, options, callback) {
  var font = svg_font(svg);
  var ttf = new TTF();
  _.forEach(font.glyphs, function (glyph) {
    ttfFont.addGlyph(font, ttf, glyph);
  });
  ttfFont.finalize(font, ttf);
  callback(null, ttf.toBuffer());
}

module.exports = svg2ttf;
