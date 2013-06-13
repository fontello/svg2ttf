/*
 Author: Sergey Batishchev <snb2003@rambler.ru>

 Written for fontello.com project.

 TTF file structure is based on https://developer.apple.com/fonts/TTRefMan/RM06/Chap6cmap.html
 */

'use strict';

var _ = require('lodash');
var tableDefs = require("./lib/tabledefs").TableDefs;
var svgParsing = require("./lib/svgparsing").SvgParsing;
var serialize = require("./lib/serialize").Serialize;

//------------------------constants--------------------------

//offsets
var TTF_OFFSET = {
  VERSION: 0,
  NUM_TABLES: 4,
  SEARCH_RANGE: 6,
  ENTRY_SELECTOR: 8,
  RANGE_SHIFT: 10,
  TABLES: 12
};

var TABLE_OFFSET = {
  TAG: 0,
  CHECK_SUM: 4,
  OFFSET: 8,
  LENGTH: 12
};

//sizes
var SIZEOF = {
  HEADER: 12,
  TABLE: 16
};

//various constants
var CONST = {
  VERSION: 1,
  NUM_TABLES: 16
}

//------------------table initialization---------------------

function initTable(schema) {
  var data = {};
  _.forEach(schema, function (field) {
    //if array, add empty array to the table instance
    data[field.name] = _.isArray(field.value) ? [] : field.value;
  });
  return data;
}

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

function addGlyph(transform, glyphArray, glyphSchema) {
  // just a stub for now
  var numberOfContours = 1;
  var instructionLength = 1;
  var glyph = initTable(glyphSchema);
  glyph.numberOfContours = numberOfContours;
  glyph.xMin = 0;
  glyph.yMin = 0;
  glyph.xMax = 0;
  glyph.yMax = 0;
  glyph.endPtsOfContoursArray = getGlyphEndPtsOfContours(transform, numberOfContours);
  glyph.endPtsOfContoursArray = getGlyphEndPtsOfContours(transform, numberOfContours);
  glyph.instructionLength = instructionLength;
  glyph.instructionsArray = getGlyphInstructions(transform, instructionLength);
  glyph.flagsArray = getGlyphFlags(transform);
  glyph.xCoordinatesArray = getGlyphXCoordinates(transform);
  glyph.yCoordinatesArray = getGlyphYCoordinates(transform);
  glyphArray.push(glyph);
  return serialize.getLength(glyph, glyphSchema);
}

function fillGlyphs(glyphTable, glyphs) {
  var offset = 0;
  var offsets = [];
  var glyphArray = glyphTable.glyf;
  var glyphSchema = tableDefs.glyf.glyf;
  for (var i = 0; i < glyphs.length; i ++) {
    offsets.push(offset);
    offset += addGlyph(glyphs[i].transform, glyphArray, glyphSchema);
  }
  return offsets;
}

function fillLocations(locationTable, offsets) {
  locationTable.offsetsArray = offsets;
}

function fillCmap(cmapTable, glyphSegments) {
  var segCount = glyphSegments.length;
  var subTable = initTable(tableDefs.cmap.subTable);
  //calculate segment indexes and offsets
  if (glyphSegments.length > 0) {
    var startGlyphCode = 1;
    _.forEach(glyphSegments, function (glyphSegment) {
      var segment = initTable(tableDefs.cmap.subTable.groupsArray);
      segment.startCharCode = glyphSegment.start.unicode;
      segment.endCharCode = glyphSegment.end.unicode;
      segment.startGlyphCode = startGlyphCode;
      subTable.groupsArray.push(segment);
      startGlyphCode += segment.endCharCode - segment.startCharCode + 1;
    });
  }
  cmapTable.subTable.push(subTable); //we have only one subtable now
}

//------------------main---------------------------------

function svg2ttf(buf, options, callback) {
  var glyphs = svgParsing.getGlyphs(buf);
  var glyphSegments = svgParsing.getGlyphSegments(glyphs);
  var tables = {};
  _.forEach(tableDefs, function (tableDef) {
    tables[tableDef.name] = initTable(tableDef.schema);
  });
  var offsets = fillGlyphs(tables.glyf, glyphs);
  fillLocations(tables.location, offsets);
  fillCmap(tables.cmap, glyphSegments);
  callback(null, serialize.writeToBuffer(tables));
}

module.exports = svg2ttf;
