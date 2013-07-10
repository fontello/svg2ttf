/*
 Author: Sergey Batishchev <snb2003@rambler.ru>

 Written for fontello.com project.

 TTF file structure is based on https://developer.apple.com/fonts/TTRefMan/RM06/Chap6.html
 */

'use strict';

var _ = require('lodash');
var svg_font = require("./lib/svg");
var Font = require("./lib/sfnt");
var generateTTF = require("./lib/ttf");
var svgPathParse = require("./lib/svg/path_parse");
var convertCubicToQuadCurves = require("./lib/svg/cubic_to_quad_curves");
var toSFMTContours = require("./lib/svg/to_sfmt_contours");

//------------------Main---------------------------------

function svg2ttf(svg, options, callback) {
  var font = new Font.Font();
  var svgFont = svg_font(svg);

  font.id = svgFont.id;
  font.familyName = svgFont.familyName;
  font.copyright = svgFont.copyright;
  font.sfntNames.push({ id: 5, value: '1.0' }); // version ID for TTF name table
  font.unitsPerEm = svgFont.unitsPerEm;
  font.weightClass = svgFont.weightClass;
  font.width = svgFont.width;
  font.height = svgFont.height;
  font.ascent = svgFont.ascent;
  font.descent = svgFont.descent;
  _.forEach(svgFont.glyphs, function (svgGlyph) {
    var glyph = new Font.Glyph();
    glyph.id = svgGlyph.id;
    glyph.unicode = svgGlyph.unicode;
    glyph.name = svgGlyph.name;
    glyph.isMissed = svgGlyph.isMissed;
    glyph.height = svgGlyph.height;
    glyph.width = svgGlyph.width;

    //SVG transformations
    var svgContours = svgPathParse(svgGlyph);
    var convertedContours = convertCubicToQuadCurves(svgContours);
    var sfmtContours = toSFMTContours(convertedContours);

    // Add contours to SFNT font
    _.forEach(sfmtContours, function (sfmtContour) {
      var contour = new Font.Contour();

      _.forEach(sfmtContour, function (sfmtPoint) {
        var point = new Font.Point();
        point.x = sfmtPoint.x;
        point.y = sfmtPoint.y;
        point.onCurve = sfmtPoint.onCurve;
        contour.points.push(point);
      });
      glyph.contours.push(contour);
    });

    font.glyphs.push(glyph);
  });

  callback(null, generateTTF(font));
}

module.exports = svg2ttf;
