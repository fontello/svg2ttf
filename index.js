/*
 * Copyright: Vitaly Puzrin
 * Author: Sergey Batishchev <snb2003@rambler.ru>
 *
 * Written for fontello.com project.
 */

'use strict';

var _       = require('lodash');
var SvgPath = require('svgpath');
var ucs2 = require('./lib/ucs2');
var svg     = require('./lib/svg');
var sfnt    = require('./lib/sfnt');

function svg2ttf(svgString, options) {
  var font = new sfnt.Font();
  var svgFont = svg.load(svgString);

  options = options || {};

  font.id = options.id || svgFont.id;
  font.familyName = options.familyname || svgFont.familyName || svgFont.id;
  font.copyright = options.copyright || svgFont.metadata;

  if(options.ts) {
    font.createdDate = font.modifiedDate = options.ts;
  }

  font.sfntNames.push({ id: 2, value: options.subfamilyname || 'Regular' }); // subfamily name
  font.sfntNames.push({ id: 4, value: options.fullname || svgFont.id }); // full name
  font.sfntNames.push({ id: 5, value: 'Version 1.0' }); // version ID for TTF name table
  font.sfntNames.push({ id: 6, value: options.fullname || svgFont.id }); // Postscript name for the font, required for OSX Font Book

  // Try to fill font metrics or guess defaults
  //
  font.unitsPerEm   = svgFont.unitsPerEm || 1000;
  font.horizOriginX = svgFont.horizOriginX || 0;
  font.horizOriginY = svgFont.horizOriginY || 0;
  font.vertOriginX  = svgFont.vertOriginX || 0;
  font.vertOriginY  = svgFont.vertOriginY || 0;
  // need to correctly convert text values, use default (400) until compleete
  //font.weightClass = svgFont.weightClass;
  font.width    = svgFont.width || svgFont.unitsPerEm;
  font.height   = svgFont.height || svgFont.unitsPerEm;
  font.descent  = !isNaN(svgFont.descent) ? svgFont.descent : -font.vertOriginY;
  font.ascent   = svgFont.ascent || (font.unitsPerEm - font.vertOriginY);

  var glyphs = font.glyphs;
  var codePoints = font.codePoints;
  var ligatures = font.ligatures;

  function addCodePoint(codePoint, glyph) {
    if(codePoints[codePoint]) {
      // Ignore code points already defined
      return false;
    }
    codePoints[codePoint] = glyph;
    return true;
  }

  // add SVG glyphs to SFNT font
  _.forEach(svgFont.glyphs, function (svgGlyph) {
    var glyph = new sfnt.Glyph();

    glyph.name = svgGlyph.name;
    glyph.d = svgGlyph.d;
    glyph.height = svgGlyph.height || font.height;
    glyph.width = svgGlyph.width || font.width;
    glyphs.push(glyph);

    svgGlyph.sfntGlyph = glyph;

    _.forEach(svgGlyph.unicode, function(codePoint) {
      addCodePoint(codePoint, glyph);
    });
  });

  var missingGlyph;

  // add missing glyph to SFNT font
  // also, check missing glyph existance and single instance
  if (svgFont.missingGlyph) {
    missingGlyph = new sfnt.Glyph();
    missingGlyph.d = svgFont.missingGlyph.d;
    missingGlyph.height = svgFont.missingGlyph.height || font.height;
    missingGlyph.width = svgFont.missingGlyph.width || font.width;
  } else {
    missingGlyph = _.find(glyphs, function(glyph) {
      return glyph.name === '.notdef';
    });
  }
  if(!missingGlyph) { // no missing glyph and .notdef glyph, we need to create missing glyph
    missingGlyph = new sfnt.Glyph();
  }

  // Create glyphs for all characters used in ligatures
  _.forEach(svgFont.ligatures, function(svgLigature) {
    var ligature = {
        ligature: svgLigature.ligature,
        unicode: svgLigature.unicode,
        glyph: svgLigature.glyph.sfntGlyph
    };
    _.forEach(ligature.unicode, function(charPoint) {
      // We need to have a distinct glyph for each code point so we can reference it in GSUB
      var glyph = new sfnt.Glyph();
      var added = addCodePoint(charPoint, glyph);
      if(added) {
        glyph.name = ucs2.encode([charPoint]);
        glyphs.push(glyph);
      }
    });
    ligatures.push(ligature);
  });

  // Missing Glyph needs to have index 0
  if(glyphs.indexOf(missingGlyph) !== -1) {
    glyphs.splice(glyphs.indexOf(missingGlyph), 1);
  }
  glyphs.unshift(missingGlyph);

  var nextID = 0;
  //add IDs
  _.forEach(glyphs, function(glyph) {
    glyph.id = nextID;
    nextID++;
  });

  _.forEach(glyphs, function (glyph) {

    //SVG transformations
    var svgPath = new SvgPath(glyph.d)
      .abs()
      .unshort()
      .iterate(svg.cubicToQuad);
    var sfntContours = svg.toSfntCoutours(svgPath);

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
  });

  var ttf = sfnt.toTTF(font);
  return ttf;
}

module.exports = svg2ttf;
