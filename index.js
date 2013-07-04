/*
 Author: Sergey Batishchev <snb2003@rambler.ru>

 Written for fontello.com project.

 TTF file structure is based on https://developer.apple.com/fonts/TTRefMan/RM06/Chap6.html
 */

'use strict';

var _ = require('lodash');
var svg_font = require("./lib/svg");
var Font = require("./lib/font");

function loadSVG(svg) {
  var font = new Font.Font();
  var svgFont = svg_font(svg);
  font.id = svgFont.id;
  font.familyName = svgFont.familyName;
  font.copyright = svgFont.copyright;
  _.forEach(svgFont.glyphs, function (svgGlyph) {
    var glyph = new Font.Glyph();
    glyph.id = svgGlyph.id;
    glyph.unicode = svgGlyph.unicode;
    glyph.name = svgGlyph.name;
    glyph.isMissed = svgGlyph.isMissed;
    glyph.height = svgGlyph.height;
    glyph.width = svgGlyph.width;
    glyph.size = svgGlyph.size;
    _.forEach(svgGlyph.contours, function (svgContour) {
      var contour = new Font.Contour();
      _.forEach(svgContour.getQuadSplinePoints(), function (svgPoint) {
        var point = new Font.Point();
        point.x = svgPoint.x;
        point.y = svgPoint.y;
        point.onCurve = svgPoint.onCurve;
        contour.points.push(point);
      });
      glyph.contours.push(contour);
    });
    font.glyphs.push(glyph);
  });
  return font;
}

//------------------Main---------------------------------

function svg2ttf(svg, options, callback) {
  var font = loadSVG(svg);
  callback(null, font.generateTTF());
}

module.exports = svg2ttf;
