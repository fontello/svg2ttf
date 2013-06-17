/*
 Author: Sergey Batishchev <snb2003@rambler.ru>

 Written for fontello.com project.

 TTF file structure is based on https://developer.apple.com/fonts/TTRefMan/RM06/Chap6.html
 */

'use strict';

var _ = require('lodash');
var SVGFont = require("./lib/svg_font");
var TTF = require("./lib/ttf");

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

function addGlyphElement(glyphTable, glyphObject) {
  // just a stub for now
  var numberOfContours = 1;
  var instructionLength = 1;
  var transform = glyphObject.transform;
  var glyph = glyphTable.glyfArray.createElement();
  glyph.numberOfContours = numberOfContours;
  glyph.xMin = 0;
  glyph.yMin = 0;
  glyph.xMax = 0;
  glyph.yMax = 0;
  glyph.endPtsOfContoursArray.createElement(getGlyphEndPtsOfContours(transform, numberOfContours));
  glyph.endPtsOfContoursArray.createElement(getGlyphEndPtsOfContours(transform, numberOfContours));
  glyph.instructionLength = instructionLength;
  glyph.instructionsArray.createElement(getGlyphInstructions(transform, instructionLength));
  glyph.flagsArray.createElement(getGlyphFlags(transform));
  glyph.xCoordinatesArray.createElement(getGlyphXCoordinates(transform));
  glyph.yCoordinatesArray.createElement(getGlyphYCoordinates(transform));
  glyphTable.glyfArray.createElement(glyph);
  return glyph;
}

function fillGlyphs(tables, glyphs) {
  var glyphTable = tables.glyf;
  var locationTable = tables.location;
  _.forEach(glyphs, function (glyph) {
    var glyphElement = addGlyphElement(glyphTable, glyph);
    locationTable.offsetsArray.createElement(glyphElement.length);
  });
}

function fillCmap(cmapTable, glyphSegments) {
  var segCount = glyphSegments.length;
  var subTable12 = cmapTable.subTable12.createElement();
  //calculate segment indexes and offsets
  if (glyphSegments.length > 0) {
    var startGlyphCode = 1;
    _.forEach(glyphSegments, function (glyphSegment) {
      var segment = subTable12.groupsArray.createElement();
      segment.startCharCode = glyphSegment.start.unicode;
      segment.endCharCode = glyphSegment.end.unicode;
      segment.startGlyphCode = startGlyphCode;
      subTable12.groupsArray.createElement(segment);
      startGlyphCode += segment.endCharCode - segment.startCharCode + 1;
    });
  }
  cmapTable.subTable12.createElement(subTable12);
}

function fillMaxp(maxpTable, glyphs) {
  maxpTable.numGlyphs = glyphs.length;
}


//------------------main---------------------------------

function svg2ttf(svg, options, callback) {
  var glyphs = SVGFont.getFont(svg);
  var ttf = new TTF();
  fillGlyphs(ttf, glyphs.items);
  fillCmap(ttf.cmap, glyphs.segments);
  fillMaxp(ttf.maxp, glyphs.items);
  callback(null, ttf.toBuffer());
}

module.exports = svg2ttf;
