'use strict';

var generateTTF = require("./ttf");

var Font = function () {
  this.glyphs = [];
  this.ascent = 0;
  this.descent = 0;
  this.familyName = '';
  this.copyright = '';
  this.generateTTF = function () {
    return generateTTF(this);
  };
};

var Glyph = function () {
  this.contours = [];
};

var Contour = function () {
  this.points = [];
};

var Point = function () {
  this.x = 0;
  this.y = 0;
  this.onCurve = true;
};

module.exports.Font = Font;
module.exports.Glyph = Glyph;
module.exports.Contour = Contour;
module.exports.Point = Point;
