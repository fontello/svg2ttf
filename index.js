/*
 * Copyright: Vitaly Puzrin 
 * Author: Sergey Batishchev <snb2003@rambler.ru>
 *
 * Written for fontello.com project.
 */

'use strict';

var _ = require('lodash');
var svg = require("./lib/svg");
var sfnt = require("./lib/sfnt");

function svg2ttf(svgString, options) {
  var font = new sfnt.Font();
  var svgFont = svg.load(svgString);

  options = options || {};

  font.id = options.id || svgFont.id;
  font.familyName = options.familyname || svgFont.familyName || svgFont.id;
  font.copyright = options.copyright || svgFont.metadata;
  font.sfntNames.push({ id: 2, value: options.subfamilyname || 'Regular' }); // subfamily name
  font.sfntNames.push({ id: 4, value: options.fullname || svgFont.id }); // full name
  font.sfntNames.push({ id: 5, value: 'Version 1.0' }); // version ID for TTF name table
  font.sfntNames.push({ id: 6, value: options.fullname || svgFont.id }); // Postscript name for the font, required for OSX Font Book

  // Try to fill font metrics or guess defaults
  //
  font.unitsPerEm = svgFont.unitsPerEm || 1000;
  // need to correctly convert text values, use default (400) until compleete
  //font.weightClass = svgFont.weightClass;
  font.width = svgFont.width || svgFont.unitsPerEm;
  font.height = svgFont.height || svgFont.unitsPerEm;
  font.descent = (svgFont.descent !== undefined) ? svgFont.descent : -Math.ceil(svgFont.unitsPerEm * 0.15);
  font.ascent = svgFont.ascent || (font.unitsPerEm + font.descent);


  _.forEach(svgFont.glyphs, function (svgGlyph) {
    var glyph = new sfnt.Glyph();

    glyph.id = svgGlyph.id;
    glyph.unicode = svgGlyph.unicode;
    glyph.name = svgGlyph.name;
    glyph.isMissed = svgGlyph.isMissed;
    glyph.height = svgGlyph.height || font.height;
    glyph.width = svgGlyph.width || font.width;

    //SVG transformations
    var svgContours = svg.pathParse(svgGlyph.d);
    svgContours = svg.cubicToQuad(svgContours, 0.3);
    var sfntContours = svg.toSfntCoutours(svgContours);

    // Add contours to SFNT font
    glyph.contours = _.map(sfntContours, function (sfntContour) {
      var contour = new sfnt.Contour();

      contour.points = _.map(sfntContour, function (sfntPoint) {
        var point = new sfnt.Point();
        point.x = sfntPoint.x;
        point.y = sfntPoint.y;
        point.onCurve = sfntPoint.onCurve;
        return point;
      });

      return contour;
    });

    font.glyphs.push(glyph);
  });

  return sfnt.toTTF(font);
}

module.exports = svg2ttf;
