/*
 Author: Sergey Batishchev <snb2003@rambler.ru>

 Written for fontello.com project.

 TTF file structure is based on https://developer.apple.com/fonts/TTRefMan/RM06/Chap6.html
 */

'use strict';

var _ = require('lodash');
var SVG = require("./lib/svg").SVG;
var TTF = require("./lib/ttf").TTF;

//------------------table initialization---------------------



//----------------conversion-----------------------------

function getGlyphEndPtsOfContours(transform, numberOfContours) {
  return [0, 1]; // just a stub for now
}

function getGlyphInstructions(transform, numberOfContours) {
  return [0, 1]; // just a stub for now
}

function getGlyphFlags(transform) {
  return [0, 1]; // just a stub for now
}

function getGlyphXCoordinates(transform) {
  return [0, 1]; // just a stub for now
}

function getGlyphYCoordinates(transform) {
  return [0, 1]; // just a stub for now
}

function addGlyph(glyphTable, glyphObject) {
  // just a stub for now
  var numberOfContours = 1;
  var instructionLength = 1;
  var transform = glyphObject.transform;
  var glyph = glyphTable.glyfArray.new();
  glyph.numberOfContours = numberOfContours;
  glyph.xMin = 0;
  glyph.yMin = 0;
  glyph.xMax = 0;
  glyph.yMax = 0;
  glyph.endPtsOfContoursArray.add(getGlyphEndPtsOfContours(transform, numberOfContours));
  glyph.endPtsOfContoursArray.add(getGlyphEndPtsOfContours(transform, numberOfContours));
  glyph.instructionLength = instructionLength;
  glyph.instructionsArray.add(getGlyphInstructions(transform, instructionLength));
  glyph.flagsArray.add(getGlyphFlags(transform));
  glyph.xCoordinatesArray.add(getGlyphXCoordinates(transform));
  glyph.yCoordinatesArray.add(getGlyphYCoordinates(transform));
  glyphTable.glyfArray.add(glyph);
}

function fillGlyphs(glyphTable, glyphs) {
  _.forEach(glyphs, function (glyph) {
    addGlyph(glyphTable, glyph);
  });
}

function fillLocations(locationTable, glyphTable) {
  _.forEach(glyphTable.glyfArray.value, function (glyph) {
    locationTable.offsetsArray.add(glyph.length);
  });
}

function fillCmap(cmapTable, glyphSegments) {
  var segCount = glyphSegments.length;
  var subTable12 = cmapTable.subTable12.new();
  //calculate segment indexes and offsets
  if (glyphSegments.length > 0) {
    var startGlyphCode = 1;
    _.forEach(glyphSegments, function (glyphSegment) {
      var segment = subTable12.groupsArray.new();
      segment.startCharCode = glyphSegment.start.unicode;
      segment.endCharCode = glyphSegment.end.unicode;
      segment.startGlyphCode = startGlyphCode;
      subTable12.groupsArray.add(segment);
      startGlyphCode += segment.endCharCode - segment.startCharCode + 1;
    });
  }
  cmapTable.subTable12.add(subTable12);
}

function fillMaxp(maxpTable, glyphs) {
  maxpTable.numGlyphs = glyphs.length;
}


//------------------main---------------------------------

function svg2ttf(svg, options, callback) {
  var glyphs = SVG.getGlyphs(svg);
  var ttf = TTF.init();
  var offsets = fillGlyphs(ttf.glyf, glyphs.items);
  fillLocations(ttf.location, ttf.glyf);
  fillCmap(ttf.cmap, glyphs.segments);
  fillMaxp(ttf.maxp, glyphs.items);
  callback(null, ttf.toBuffer());
}

module.exports = svg2ttf;
