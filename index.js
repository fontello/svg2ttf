/*
 Author: Sergey Batishchev <snb2003@rambler.ru>

 Written for fontello.com project.

 TTF file structure is based on https://developer.apple.com/fonts/TTRefMan/RM06/Chap6cmap.html
 */

'use strict';

var DOMParser = require('xmldom').DOMParser;
var _ = require('lodash');

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

//--------------------Table data templates-------------------

var CMAPTEMPLATE = [
  { name: 'version', value: 0, length: 2 },
  { name: 'count', value: 1, length: 2 },
  { name: 'platform', value: 3, length: 2 },
  //windows standard
  { name: 'encoding', value: 1, length: 2 },
  //unicode
  { name: 'subTableOffset', value: 12, length: 4 },
  //Format 4 subtable
  { name: 'stFormat', value: 4, length: 2 },
  { name: 'stLength', value: 32, length: 2 },
  { name: 'stVersion', value: 0, length: 2 },
  { name: 'stSegCountX2', value: 4, length: 2 },
  { name: 'stSearchRange', value: 4, length: 2 },
  { name: 'stEntrySelector', value: 1, length: 2 },
  { name: 'stRangeShift', value: 0, length: 2 },
  { name: 'stEndCountArray', value: [
    {length: 2 }
  ] },
  { name: 'reservedPad', value: 0, length: 2 },
  { name: 'stStartCountArray', value: [
    {length: 2 }
  ] },
  { name: 'stIdDeltaArray', value: [
    {length: 2}
  ] },
  {name: 'stIdRangeOffsetArray', value: [
    {length: 2 }
  ] },
  {name: 'stGlyphIdArray', value: [
    {length: 2}
  ] }
];

var GLYFTEMPLATE = [
  { name: 'glyph', value: [
    { name: 'numberOfContours', value: 0, length: 2, signed: true },
    { name: 'xMin', value: 0, length: 2, signed: true },
    { name: 'yMin', value: 0, length: 2, signed: true },
    { name: 'xMax', value: 0, length: 2, signed: true },
    { name: 'yMax', value: 0, length: 2, signed: true },
    { name: 'endPtsOfContoursArray', value: [
      {length: 2 }
    ] },
    { name: 'instructionLength', value: 0, length: 2 },
    { name: 'instructionsArray', value: [
      {length: 1}
    ] },
    { name: 'flagsArray', value: [
      {length: 1}
    ] },
    { name: 'xCoordinatesArray', value: [
      {length: 1}
    ] },
    { name: 'yCoordinatesArray', value: [
      {length: 1}
    ] }
  ]}
];

var HEADTEMPLATE = [
  { name: 'version', value: 0x10000, length: 4, signed: true },
  { name: 'fontRevision', value: 0, length: 4, signed: true },
  { name: 'checkSumAdjustment', value: 0, length: 4, signed: true },
  { name: 'magicNumber', value: 0x5F0F3CF5, length: 4},
  { name: 'flags', value: 0, length: 2 },
  { name: 'unitsPerEm', value: 0x200, length: 2 },
  { name: 'created', value: 0, length: 8 },
  { name: 'modified', value: 0, length: 8 },
  { name: 'xMin', value: 0, length: 2 },
  { name: 'yMin', value: 0, length: 2 },
  { name: 'xMax', value: 0x100, length: 2 },
  { name: 'yMax', value: 0, length: 2 },
  { name: 'macStyle', value: 0, length: 2 },
  { name: 'lowestRecPPEM', value: 1, length: 2 },
  { name: 'fontDirectionHint', value: 2, length: 2 },
  { name: 'indexToLocFormat', value: 1, length: 2 },
  { name: 'glyphDataFormat', value: 0, length: 2 }
];

var HHEADTEMPLATE = [
  { name: 'version', value: 0x10000, length: 4, signed: true },
  { name: 'Ascender', value: 0, length: 4, signed: true },
  { name: 'Descender', value: 0, length: 4, signed: true },
  { name: 'LineGap', value: 0x5F0F3CF5, length: 4, signed: true },
  { name: 'advanceWidthMax', value: 0, length: 2 },
  { name: 'minLeftSideBearing', value: 0x200, length: 2, signed: true },
  { name: 'minRightSideBearing', value: 0, length: 2, signed: true },
  { name: 'xMaxExtent', value: 0, length: 2, signed: true },
  { name: 'caretSlopeRise', value: 0, length: 2, signed: true },
  { name: 'caretSlopeRun', value: 0, length: 2, signed: true },
  { name: 'reserved', value: 0, length: 10 },
  { name: 'metricDataFormat', value: 0, length: 2, signed: true },
  { name: 'numberOfHMetrics', value: 1, length: 2 }
];

var HMTXTEMPLATE = [
  { name: 'hMetrics', length: 4, signed: true },
  { name: 'leftSideBearing', length: 2, signed: true }
];

var LOCATEMPLATE = [
  { name: 'offsetsArray', value: [
    { length: 4}
  ] }
];

var MAXPTEMPLATE = [
  { name: 'version', value: 0x10000, length: 4, signed: true },
  { name: 'numGlyphs', value: 0, length: 2 },
  { name: 'maxPoints', value: 1, length: 2 },
  { name: 'maxContours', value: 1, length: 2 },
  { name: 'maxCompositePoints', value: 0, length: 2 },
  { name: 'maxCompositeContours', value: 0, length: 2 },
  { name: 'maxZones', value: 2, length: 2 },
  { name: 'maxTwilightPoints', value: 0, length: 2 },
  { name: 'maxStorage', value: 0, length: 2 },
  { name: 'maxFunctionDefs', value: 0, length: 2 },
  { name: 'maxInstructionDefs', value: 0, length: 2 },
  { name: 'maxStackElements', value: 0, length: 2 },
  { name: 'maxSizeOfInstructions', value: 0, length: 2 },
  { name: 'maxComponentElements', value: 0, length: 2 },
  { name: 'maxComponentDepth', value: 0, length: 2 }
];

var NAMETEMPLATE = [
  { name: 'formatSelector', value: 0, length: 2 },
  { name: 'nameRecordsCount', value: 0, length: 2 },
  { name: 'offset', value: 0, length: 2 },
  { name: 'nameRecordsArray', value: [
    {length: 2}
  ] },
  { name: 'actualStringData', value: 0, length: 2 }
];

var POSTTEMPLATE = [
  { name: 'formatType', value: 0x10000, length: 4, signed: true },
  { name: 'italicAngle', length: 4, value: 0, signed: true },
  { name: 'underlinePosition', length: 4, value: 0, signed: true },
  { name: 'underlineThickness', length: 4, value: 0, signed: true },
  { name: 'isFixedPitch', length: 4, value: 0 },
  { name: 'minMemType42', length: 4, value: 0 },
  { name: 'maxMemType42', length: 4, value: 0 },
  { name: 'minMemType1', length: 4, value: 0 },
  { name: 'maxMemType1', length: 4, value: 0 }
];

var OS2TEMPLATE = [
  { name: 'version', value: 4, length: 2 },
  { name: 'xAvgCharWidth', value: 1, length: 2, signed: true },
  { name: 'usWeightClass', value: 100, length: 2 },
  { name: 'usWidthClass', value: 1, length: 2 },
  { name: 'fsType', value: 1, length: 2, signed: true },
  { name: 'ySubscriptXSize', value: 0, length: 2, signed: true },
  { name: 'ySubscriptYSize', value: 0, length: 2, signed: true },
  { name: 'ySubscriptXOffset', value: 0, length: 2, signed: true },
  { name: 'ySubscriptYOffset', value: 0, length: 2, signed: true },
  { name: 'ySuperscriptXSize', value: 0, length: 2, signed: true },
  { name: 'ySuperscriptYSize', value: 0, length: 2, signed: true },
  { name: 'ySuperscriptXOffset', value: 0, length: 2, signed: true },
  { name: 'ySuperscriptYOffset', value: 0, length: 2, signed: true },
  { name: 'yStrikeoutSize', value: 0, length: 2, signed: true },
  { name: 'yStrikeoutPosition', value: 0, length: 2, signed: true },
  { name: 'sFamilyClass', value: 0, length: 2, signed: true },
  { name: 'panose', value: 0, length: 10 },
  { name: 'ulUnicodeRange1', value: 0, length: 4 },
  { name: 'ulUnicodeRange2', value: 0, length: 4 },
  { name: 'ulUnicodeRange3', value: 0, length: 4 },
  { name: 'ulUnicodeRange4', value: 0, length: 4 },
  { name: 'achVendID', value: 0, length: 4 },
  { name: 'fsSelection', value: 0, length: 2 },
  { name: 'usFirstCharIndex', value: 0, length: 2 },
  { name: 'usLastCharIndex', value: 0, length: 2 },
  { name: 'sTypoAscender', value: 0, length: 2 },
  { name: 'sTypoDescender', value: 0, length: 2 },
  { name: 'sTypoLineGap', value: 0, length: 2 },
  { name: 'usWinAscent', value: 256, length: 2 },
  { name: 'usWinDescent', value: 0, length: 2 },
  { name: 'ulCodePageRange1', value: 0, length: 4 },
  { name: 'ulCodePageRange2', value: 0, length: 4}
]

//--------------------------TTF tables-----------------------

var TTF_TABLES = {
  CMAP: { name: 'cmap', template: CMAPTEMPLATE }, //defines the mapping of character codes to the glyph index values used in the font
  GLYF: { name: 'glyf', template: GLYFTEMPLATE }, // contains information for horizontal layout
  HEAD: { name: 'head', template: HEADTEMPLATE }, // gives global information about the font
  HHEAD: { name: 'hhea', template: HHEADTEMPLATE }, // contains information for horizontal layout
  HMTX: { name: 'hmtx', template: HMTXTEMPLATE }, // contains metric information for the horizontal layout each of the glyphs in the font.
  LOCA: { name: 'loca', template: LOCATEMPLATE }, // stores the offsets to the locations of the glyphs in the font relative to the beginning of the 'glyf' table.
  MAXP: { name: 'maxp', template: MAXPTEMPLATE }, // establishes the memory requirements for a font.
  NAME: { name: 'name', template: NAMETEMPLATE }, // allows to include human-readable names for features and settings, copyright notices, font names, style names, and other information related to the font.
  POST: { name: 'post', template: POSTTEMPLATE }, // contains information needed to use a TrueType font on a PostScript printer.
  OS2: { name: 'OS/2', template: OS2TEMPLATE } // consists of a set of metrics that are required by OS/2 and Windows.
}

//--------------------common routines-----------------------

function isArray(value) {
  return Object.prototype.toString.call(value) === '[object Array]';
}

function clone(obj) {
  if (isArray(obj)) {
    var clonedArray = [];
    for (var i = 0; i < obj.length; i ++) {
      if (typeof(obj[i]) == "object")
        clonedArray.push(clone(obj[i]));
      else
        clonedArray.push(obj[i]);
    }
    return clonedArray;
  }
  else {
    var clonedObject = {};
    for (var i in obj) {
      if (typeof(obj[i]) == "object")
        clonedObject[i] = clone(obj[i]);
      else
        clonedObject[i] = obj[i];
    }
    return clonedObject;
  }
}

//------------------table initialization---------------------

function initTableData(dataTemplate) {
  var data = [];
  for (var name in dataTemplate) {
    var item = dataTemplate[name];
    if (isArray(item.value)) //is array, add empty array to the table instance
      addValue(data, item.name, []);
    else
      addValue(data, item.name, item.value);
  }
  return data;
}

function createTable(table, doc, offset) {
  return {
    tag: table.name,
    checkSum: 0,
    offset: 0,
    length: 0,
    data: initTableData(table.template)
  }
}

//------------------table routines------------------------

function addValue(object, name, value) {
  object.push({name: name, value: value});
}

function getTableValue(object, name, value) {
  //TODO: think about index cache
  for (var i = 0; i < object.length; i ++) {
    if (object[i].name == name) {
      return object[i].value;
    }
  }
}

function setTableValue(object, name, value) {
  //TODO: think about index cache
  for (var i = 0; i < object.length; i ++) {
    if (object[i].name == name) {
      object[i].value = value;
      break;
    }
  }
}

function setArray(object, name, value) {
  for (var elem in object) {
    if (elem.name == name) {
      elem.array = value;
      break;
    }
  }
}

function getTableValue(tableData, templateKey) {
  for (var i = 0; i < tableData.length; i ++) {
    if (tableData[i].name == templateKey)
      return tableData[i].value;
  }
}

function fillTableArray(object, template, name, array) {
  var tableArray = getTableValue(object, name);
  tableArray.length = 0;
  var arrayTemplate = getTableValue(template, name)[0];
  for (var i = 0; i < array.length; i ++) {
    var arrayInstance = clone(arrayTemplate);
    arrayInstance.value = array[i];
    tableArray.push(arrayInstance);
  }
}

function getTableLength(object) {
  var length = 0;
  for (var i = 0; i < object.length; i ++) {
    var value = object[i].value;
    if (isArray(value))
      length += getTableLength(value);
    else
      length += object[i].length;
  }
  return length;
}

//------------------common routines--------------------------------

function stringToUInt32(value) {
  var result = 0;
  var shift = 0;
  for (var i = 0; i < value.length; ++ i) {
    var char = value.charcodeAt(i);
    result += shift * char;
    shift *= 256;
  }
  return result;
}

//------------------serialization to the buffer---------------------

function serialize(tables) {
  //still in comments
  /*  var buf = new Buffer(1000000); //some magic number of bytes
   buf.writeUInt16BE(CONST.VERSION, TTF_OFFSET.VERSION);
   buf.writeUInt16BE(CONST.NUM_TABLES, TTF_OFFSET.NUM_TABLES);
   buf.writeUInt16BE(CONST.NUM_TABLES, TTF_OFFSET.SEARCH_RANGE);
   buf.writeUInt16BE(CONST.NUM_TABLES, TTF_OFFSET.ENTRY_SELECTOR);
   buf.writeUInt16BE(CONST.NUM_TABLES, TTF_OFFSET.RANGE_SHIFT);
   */

  return new Buffer(0); //just a stub
}

//------------------------SVG parsing------------------------------

function getGlyphs(doc) {

  var result = []
    , fontHorizAdvX
    , ascent
    , descent
    , glyphSize = 1000;

  var font = doc.getElementsByTagName('font')[0];
  var fontFace = font.getElementsByTagName('font-face')[0];

  var fontHorizAdvX = + font.getAttribute('horiz-adv-x');
  var ascent = + fontFace.getAttribute('ascent');
  var descent = - fontFace.getAttribute('descent');

  _.each(font.getElementsByTagName('glyph'), function (glyph) {

    // Ignore empty glyphs (with empty code or path)
    if (! glyph.hasAttribute('d')) {
      return;
    }
    if (! glyph.hasAttribute('unicode')) {
      return;
    }

    var d = glyph.getAttribute('d');

    var character = glyph.getAttribute('unicode');

    var name = glyph.getAttribute('glyph-name') || ('glyph' + character);

    //
    // Rescale & Transform from scg fomt to svg image coordinates
    // !!! Transforms go in back order !!!
    //

    var width = glyph.getAttribute('horiz-adv-x') || fontHorizAdvX;
    var height = ascent + descent;
    var scale = glyphSize / height;

    // vertical mirror
    var transform = 'translate(0 ' + (glyphSize / 2) + ') scale(1 -1) translate(0 ' + (- glyphSize / 2) + ')';

    if (scale !== 1) {
      // scale size, only when needed
      transform += ' scale(' + scale + ')';
      // recalculate width & height
      width = width * scale;
      height = height * scale;
    }
    // descent shift
    transform += ' translate(0 ' + descent + ')';


    result.push({
      d: d,
      transform: transform,
      character: character,
      unicode: character.charCodeAt(),
      name: name,
      width: width,
      height: height
    });

  });

  result.sort(function (a, b) { return a.unicode < b.unicode ? - 1 : 1; });
  return result;
}

//create non-interruptable segments of unicode characters for filling table CMAP
function getGlyphSegments(glyphs) {
  var segments = [];
  var isFirstSegment = true;
  var prevGlyphUnicode = 0;
  var prevSegment = {};
  var segment = {};

  for (var i = 0; i < glyphs.length; i ++) {
    var glyph = glyphs[i];
    //initialize first segment or add new segment if code "hole" is found
    if (isFirstSegment || glyph.unicode != prevGlyphUnicode + 1) {
      if (! isFirstSegment) {
        segment.end = glyphs[i - 1];
        segments.push(segment);
        segment = {};
      }
      else
        isFirstSegment = false;
      segment.start = glyph;
    }
    prevGlyphUnicode = glyph.unicode;
  }

  //need to finish the last segment
  if (! isFirstSegment) {
    segment.end = glyphs[glyphs.length - 1];
    segments.push(segment);
  }
  return segments;
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

function addGlyph(transform, glyphArray, glyphTemplate) {
  // just a stub for now
  var numberOfContours = 1;
  var instructionLength = 1;
  var glyph = clone(glyphTemplate);
  setTableValue(glyph, 'numberOfContours', numberOfContours);
  setTableValue(glyph, 'xMin', 0);
  setTableValue(glyph, 'yMin', 0);
  setTableValue(glyph, 'xMax', 0);
  setTableValue(glyph, 'yMax', 0);
  fillTableArray(glyph, glyphTemplate, 'endPtsOfContoursArray', getGlyphEndPtsOfContours(transform, numberOfContours));
  setTableValue(glyph, 'instructionLength', instructionLength);
  fillTableArray(glyph, glyphTemplate, 'instructionsArray', getGlyphInstructions(transform, instructionLength));
  fillTableArray(glyph, glyphTemplate, 'flagsArray', getGlyphFlags(transform));
  fillTableArray(glyph, glyphTemplate, 'xCoordinatesArray', getGlyphXCoordinates(transform));
  fillTableArray(glyph, glyphTemplate, 'yCoordinatesArray', getGlyphYCoordinates(transform));
  glyphArray.push(glyph);
  return getTableLength(glyph);
}

function fillGlyphs(glyphTable, glyphs) {
  var offsets = [];
  var glyphArray = getTableValue(glyphTable, 'glyph');
  var glyphTemplate = getTableValue(GLYFTEMPLATE, 'glyph');
  for (var i = 0; i < glyphs.length; i ++) {
    offsets.push(addGlyph(glyphs[i].transform, glyphArray, glyphTemplate));
  }
  return offsets;
}

function fillLocations(tables, offsets) {
  return; //need to debug
  var locationsTable = tables.LOCA;
  var locationsArray = getTableValue(glyphTable, 'offsetsArray');
  var locationsTemplate = getTableValue(LOCATEMPLATE, 'offsetsArray');
  var locations = clone(locationsTemplate);
  fillTableArray(locationsTable, 'offsets', offsets);
}

//------------------main---------------------------------

function svg2ttf(buf, options, callback) {
  var doc = (new DOMParser()).parseFromString(buf, "application/xml");
  var glyphs = getGlyphs(doc);
  var glyphSegments = getGlyphSegments(glyphs);
  var tables = {};
  var offset = TTF_OFFSET.TABLES;
  for (var tableTemplate in TTF_TABLES) {
    tables[tableTemplate] = createTable(TTF_TABLES[tableTemplate]);
  }
  var offsets = fillGlyphs(tables.GLYF.data, glyphs);
  fillLocations(tables.LOCA.data, offsets);
  callback(null, serialize(tables));
}

module.exports = svg2ttf;
