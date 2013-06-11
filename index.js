/*
 Author: Sergey Batishchev <snb2003@rambler.ru>

 Written for fontello.com project.

 TTF file structure is based on https://developer.apple.com/fonts/TTRefMan/RM06/Chap6cmap.html
 */

'use strict';

var _ = require('lodash');
var tableDefs = require("./tabledefs").TableDefs;
var svgParsing = require("./svgparsing").SvgParsing;
var serialize = require("./serialize").Serialize;

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

function initTableData(tableSchema) {
  var data = {};
  _.forEach(tableSchema, function (field) {
    //if array, add empty array to the table instance
    data[field.name] = _.isArray(field.value) ? [] : field.value;
  });
  return data;
}

function createTable(table, doc, offset) {
  return {
    tag: table.name,
    checkSum: 0,
    offset: 0,
    length: 0,
    data: initTableData(table.schema)
  }
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
  var glyph = initTableData(glyphSchema);
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
  var offsets = [];
  var glyphArray = glyphTable.glyf;
  var glyphSchema = tableDefs.glyf.glyf;
  for (var i = 0; i < glyphs.length; i ++) {
    offsets.push(addGlyph(glyphs[i].transform, glyphArray, glyphSchema));
  }
  return offsets;
}

function fillLocations(tables, offsets) {
  return; //under construction
  /*var locationsTable = tables.LOCA;
  var locationsArray = getTableValue(glyphTable, 'offsetsArray');
  var locationsTemplate = getTableValue(LOCATEMPLATE, 'offsetsArray');
  var locations = clone(locationsTemplate);
  fillTableArray(locationsTable, 'offsets', offsets);*/
}

//------------------main---------------------------------

function svg2ttf(buf, options, callback) {
  var glyphs = svgParsing.getGlyphs(buf);
  var glyphSegments = svgParsing.getGlyphSegments(glyphs);
  var tables = {};
  var offset = TTF_OFFSET.TABLES;
  _.forEach(tableDefs, function (tableDef) {
    tables[tableDef.name] = createTable(tableDef);
  });
  var offsets = fillGlyphs(tables.glyf.data, glyphs);
  fillLocations(tables.location.data, offsets);
  callback(null, serialize.writeToBuffer(tables));
}

module.exports = svg2ttf;
