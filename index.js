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
var svgConvertToRelative = require("./lib/svg/to_relative_points");
var svgConvertSmoothCurves = require("./lib/svg/to_generic_curves");
var svgToContours = require("./lib/svg/to_contours");

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
    var svgPoints = svgPathParse(svgGlyph);
    svgPoints = svgConvertToRelative(svgPoints);
    svgPoints = svgConvertSmoothCurves(svgPoints);
    var svgContours = svgToContours(svgPoints);

    // Add contours to SFNT font
    _.forEach(svgContours, function (svgContour) {
      var contour = new Font.Contour();

      _.forEach(svgContour.points, function (svgPoint) {
        var point = new Font.Point();
        point.x = svgPoint.x;
        point.y = svgPoint.y;
        point.onCurve = svgPoint.onCurve;
        contour.points.push(point);
      });
      glyph.contours.push(contour);
    });


      /*var contour = new Font.Contour();
      var point = new Font.Point();
      point.x = 200;
      point.y = 200;
      point.onCurve = 1;
      contour.points.push(point);
    var point = new Font.Point();
    point.x = 0;
    point.y = 1000;
    point.onCurve = 1;
    contour.points.push(point);
    var point = new Font.Point();
    point.x = 1000;
    point.y = 0;
    point.onCurve = 1;
    contour.points.push(point);
    var point = new Font.Point();
    point.x = 0;
    point.y = -1000;
    point.onCurve = 1;
    contour.points.push(point);
    var point = new Font.Point();
    point.x = -1000;
    point.y = 0;
    point.onCurve = 1;
    contour.points.push(point);
    glyph.contours.push(contour);

    var contour = new Font.Contour();
    var point = new Font.Point();
    point.x = 50;
    point.y = 50;
    point.onCurve = 1;
    contour.points.push(point);
    var point = new Font.Point();
    point.x = 0;
    point.y = 800;
    point.onCurve = 1;
    contour.points.push(point);
    var point = new Font.Point();
    point.x = 800;
    point.y = 0;
    point.onCurve = 1;
    contour.points.push(point);
    var point = new Font.Point();
    point.x = 0;
    point.y = -800;
    point.onCurve = 1;
    contour.points.push(point);
    var point = new Font.Point();
    point.x = -800;
    point.y = 0;
    point.onCurve = 1;
    contour.points.push(point);
    glyph.contours.push(contour);*/

    font.glyphs.push(glyph);
  });

  callback(null, generateTTF(font));
}

module.exports = svg2ttf;
