/*
 Author: Sergey Batishchev <snb2003@rambler.ru>

 Written for fontello.com project.
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

var CMAPTEMPLATE = {
  VERSION: {name: 'version', value: 0, length: 2},
  COUNT: {name: 'count', value: 1, length: 2},
  PLATFORM: {name: 'platform', value: 3, length: 2}, //windows standard
  ENCODING: {name: 'encoding', value: 1, length: 2}, //unicode
  SUBTABLEOFFSET: {name: 'subTableOffset', value: 12, length: 4},
  //Format 4 subtable
  STFORMAT: {name: 'stFormat', value: 4, length: 2},
  STLENGTH: {name: 'stLength', value: 32, length: 2},
  STVERSION: {name: 'stVersion', value: 0, length: 2},
  STSEGCOUNTX2: {name: 'stSegCountX2', value: 4, length: 2},
  STSEARCHRANGE: {name: 'stSearchRange', value: 4, length: 2},
  STENTRYSELECTOR: {name: 'stEntrySelector', value: 1, length: 2},
  STRANGESHIFT: {name: 'stRangeShift', value: 0, length: 2},
  STENDCOUNTARRAY: {name: 'stEndCountArray', length: 2},
  STRESERVEDPAD: {name: 'reservedPad', value: 0, length: 2},
  STSTARTCOUNTARRARRAY: {name: 'stStartCountArray', length: 2},
  STIDDELTAARRAY: {name: 'stIdDeltaArray', length: 2},
  STIDRANGEOFFSETARRAY: {name: 'stIdRangeOffsetArray', length: 2},
  STGLYPHIDARRAY: {name: 'stGlyphIdArray', length: 2}
}

var GLYFTEMPLATE = {
  GLYPH: {
    name: 'glyph',
    valueTemplate: [
      {
        NUMBEROFCONTOURS: {name: 'numberOfContours', value: 0, length: 2, signed: true},
        XMIN: {name: 'xMin', value: 0, length: 2, signed: true},
        YMIN: {name: 'yMin', value: 0, length: 2, signed: true},
        XMAX: {name: 'xMax', value: 0, length: 2, signed: true},
        YMAX: {name: 'yMax', value: 0, length: 2, signed: true}
      }
    ]
  },
  GLYPHDESCRIPTION: {
    name: 'glyphDescription',
    valueTemplate: [
      {
        ENDPTSOFCONTOURSARRAY: {name: 'endPtsOfContoursArray', length: 2},
        INSTRUCTIONLENGTH: {name: 'instructionLength', value: 0, length: 2},
        INSTRUCTIONSARRAY: {name: 'instructionsArray', length: 1},
        FLAGSARRAY: {name: 'flagsArray', length: 1},
        XCOORDINATESARRAY: {name: 'xCoordinatesArray', length: 1},
        YCOORDINATESARRAY: {name: 'yCoordinatesArray', length: 1}
      }
    ]
  }
}

var HEADTEMPLATE = {
  VERSION: {name: 'version', value: 0x10000, length: 4, signed: true},
  FONTREVISION: {name: 'fontRevision', value: 0, length: 4, signed: true},
  CHECKSUMADJUSTMENT: {name: 'checkSumAdjustment', value: 0, length: 4, signed: true},
  MAGICNUMBER: {name: 'magicNumber', value: 0x5F0F3CF5, length: 4},
  FLAGS: {name: 'flags', value: 0, length: 2},
  UNITSPEREM: {name: 'unitsPerEm', value: 0x200, length: 2},
  CREATED: {name: 'created', value: 0, length: 8},
  MODIFIED: {name: 'modified', value: 0, length: 8},
  XMIN: {name: 'xMin', value: 0, length: 2},
  YMIN: {name: 'yMin', value: 0, length: 2},
  XMAX: {name: 'xMax', value: 0x100, length: 2},
  YMAX: {name: 'yMax', value: 0, length: 2},
  MACSTYLE: {name: 'macStyle', value: 0, length: 2},
  LOWESTRECPPEM: {name: 'lowestRecPPEM', value: 1, length: 2},
  FONTDIRECTIONHINT: {name: 'fontDirectionHint', value: 2, length: 2},
  INDEXTOLOCFORMAT: {name: 'indexToLocFormat', value: 1, length: 2},
  GLYPHDATAFORMAT: {name: 'glyphDataFormat', value: 0, length: 2}
}

var HHEADTEMPLATE = {
  VERSION: {name: 'version', value: 0x10000, length: 4, signed: true},
  Ascender: {name: 'Ascender', value: 0, length: 4, signed: true},
  DESCENDER: {name: 'Descender', value: 0, length: 4, signed: true},
  LINEGAP: {name: 'LineGap', value: 0x5F0F3CF5, length: 4, signed: true},
  ADVANCEWIDTHMAX: {name: 'advanceWidthMax', value: 0, length: 2},
  MINLEFTSIDEBEARING: {name: 'minLeftSideBearing', value: 0x200, length: 2, signed: true},
  MINRIGHTSIDEBEARING: {name: 'minRightSideBearing', value: 0, length: 2, signed: true},
  XMAXEXTENT: {name: 'xMaxExtent', value: 0, length: 2, signed: true},
  CARETSLOPERISE: {name: 'caretSlopeRise', value: 0, length: 2, signed: true},
  CARETSLOPERUN: {name: 'caretSlopeRun', value: 0, length: 2, signed: true},
  RESERVED: {name: 'reserved', value: 0, length: 10},
  METRICDATAFORMAT: {name: 'metricDataFormat', value: 0, length: 2, signed: true},
  NUMBEROFHMETRICS: {name: 'numberOfHMetrics', value: 1, length: 2}
}

var HMTXTEMPLATE = {
  VERSION: {name: 'hMetrics', length: 4, signed: true},
  ASCENDER: {name: 'leftSideBearing', length: 2, signed: true}
}

var LOCATEMPLATE = {
  OFFSETSARRAY: {name: 'offsetsArray', length: 4}
}

var MAXPTEMPLATE = {
  VERSION: {name: 'version', value: 0x10000, length: 4, signed: true},
  NUMGLYPHS: {name: 'numGlyphs', value: 0, length: 2},
  MAXPOINTS: {name: 'maxPoints', value: 1, length: 2},
  MAXCONTOURS: {name: 'maxContours', value: 1, length: 2},
  MAXCOMPOSITEPOINTS: {name: 'maxCompositePoints', value: 0, length: 2},
  MAXCOMPOSITECONTOURS: {name: 'maxCompositeContours', value: 0, length: 2},
  MAXZONES: {name: 'maxZones', value: 2, length: 2},
  MAXTWILIGHTPOINTS: {name: 'maxTwilightPoints', value: 0, length: 2},
  MAXSTORAGE: {name: 'maxStorage', value: 0, length: 2},
  MAXFUNCTIONDEFS: {name: 'maxFunctionDefs', value: 0, length: 2},
  MAXINSTRUCTIONDEFS: {name: 'maxInstructionDefs', value: 0, length: 2},
  MAXSTACKELEMENTS: {name: 'maxStackElements', value: 0, length: 2},
  MAXSIZEOFINSTRUCTIONS: {name: 'maxSizeOfInstructions', value: 0, length: 2},
  MAXCOMPONENTELEMENTS: {name: 'maxComponentElements', value: 0, length: 2},
  MAXCOMPONENTDEPTH: {name: 'maxComponentDepth', value: 0, length: 2}
}

var NAMETEMPLATE = {
  FORMATSELECTOR: {name: 'formatSelector', value: 0, length: 2},
  NAMERECORDSCOUNT: {name: 'nameRecordsCount', value: 0, length: 2},
  OFFSET: {name: 'offset', value: 0, length: 2},
  NAMERECORDSARRAY: {name: 'nameRecordsArray', length: 2},
  ACTUALSTRINGDATA: {name: 'actualStringData', value: 0, length: 2}
}

var POSTTEMPLATE = {
  FORMATTYPE: {name: 'formatType', value: 0x10000, length: 4, signed: true},
  ITALICANGLE: {name: 'italicAngle', length: 4, value: 0, signed: true},
  UNDERLINEPOSITION: {name: 'underlinePosition', length: 4, value: 0, signed: true},
  UNDERLINETHICKNESS: {name: 'underlineThickness', length: 4, value: 0, signed: true},
  ISFIXEDPITCH: {name: 'isFixedPitch', length: 4, value: 0},
  MINMEMTYPE42: {name: 'minMemType42', length: 4, value: 0},
  MAXMEMTYPE42: {name: 'maxMemType42', length: 4, value: 0},
  MINMEMTYPE1: {name: 'minMemType1', length: 4, value: 0},
  MAXMEMTYPE1: {name: 'maxMemType1', length: 4, value: 0}
}

var OS2TEMPLATE = {
  VERSION: {name: 'version', value: 4, length: 2},
  XAVGCHARWIDTH: {name: 'xAvgCharWidth', value: 1, length: 2, signed: true},
  USWEIGHTCLASS: {name: 'usWeightClass', value: 100, length: 2},
  USWIDTHCLASS: {name: 'usWidthClass', value: 1, length: 2},
  FSTYPE: {name: 'fsType', value: 1, length: 2, signed: true},
  YSUBSCRIPTXSIZE: {name: 'ySubscriptXSize', value: 0, length: 2, signed: true},
  YSUBSCRIPTYSIZE: {name: 'ySubscriptYSize', value: 0, length: 2, signed: true},
  YSUBSCRIPTXOFFSET: {name: 'ySubscriptXOffset', value: 0, length: 2, signed: true},
  YSUBSCRIPTYOFFSET: {name: 'ySubscriptYOffset', value: 0, length: 2, signed: true},
  YSUPERSCRIPTXSIZE: {name: 'ySuperscriptXSize', value: 0, length: 2, signed: true},
  YSUPERSCRIPTYSIZE: {name: 'ySuperscriptYSize', value: 0, length: 2, signed: true},
  YSUPERSCRIPTXOFFSET: {name: 'ySuperscriptXOffset', value: 0, length: 2, signed: true},
  YSUPERSCRIPTYOFFSET: {name: 'ySuperscriptYOffset', value: 0, length: 2, signed: true},
  YSTRIKEOUTSIZE: {name: 'yStrikeoutSize', value: 0, length: 2, signed: true},
  YSTRIKEOUTPOSITION: {name: 'yStrikeoutPosition', value: 0, length: 2, signed: true},
  SFAMILYCLASS: {name: 'sFamilyClass', value: 0, length: 2, signed: true},
  PANOSE: {name: 'panose', value: 0, length: 10},
  ULUNICODERANGE1: {name: 'ulUnicodeRange1', value: 0, length: 4},
  ULUNICODERANGE2: {name: 'ulUnicodeRange2', value: 0, length: 4},
  ULUNICODERANGE3: {name: 'ulUnicodeRange3', value: 0, length: 4},
  ULUNICODERANGE4: {name: 'ulUnicodeRange4', value: 0, length: 4},
  ACHVENDID: {name: 'achVendID', value: 0, length: 4},
  FSSELECTION: {name: 'fsSelection', value: 0, length: 2},
  USFIRSTCHARINDEX: {name: 'usFirstCharIndex', value: 0, length: 2},
  USLASTCHARINDEX: {name: 'usLastCharIndex', value: 0, length: 2},
  STYPOASCENDER: {name: 'sTypoAscender', value: 0, length: 2},
  STYPODESCENDER: {name: 'sTypoDescender', value: 0, length: 2},
  STYPOLINEGAP: {name: 'sTypoLineGap', value: 0, length: 2},
  USWINASCENT: {name: 'usWinAscent', value: 256, length: 2},
  USWINDESCENT: {name: 'usWinDescent', value: 0, length: 2},
  ULCODEPAGERANGE1: {name: 'ulCodePageRange1', value: 0, length: 4},
  ULCODEPAGERANGE2: {name: 'ulCodePageRange2', value: 0, length: 4}
}

//--------------------------TTF tables-----------------------

var TTF_TABLES = {
  CMAP: {name: 'cmap', template: CMAPTEMPLATE},
  GLYF: {name: 'glyf', template: GLYFTEMPLATE},
  HEAD: {name: 'head', template: HEADTEMPLATE},
  HHEAD: {name: 'hhea', template: HHEADTEMPLATE},
  HMTX: {name: 'hmtx', template: HMTXTEMPLATE},
  LOCA: {name: 'loca', template: LOCATEMPLATE},
  MAXP: {name: 'maxp', template: MAXPTEMPLATE},
  NAME: {name: 'name', template: NAMETEMPLATE},
  POST: {name: 'post', template: POSTTEMPLATE},
  OS2: {name: 'OS/2', template: OS2TEMPLATE}
}

//------------------table initialization---------------------

function initTableData(dataTemplate) {
  var data = [];
  for (var name in dataTemplate) {
    addValue(data, dataTemplate[name].name, dataTemplate[name].value);
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

//------------------table value routines------------------------

function addValue(object, name, value) {
  object.push({name: name, value: value});
}

function setValue(object, name, value) {
  for (var elem in object) {
    if (elem.name == name) {
      elem.value = value;
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

//------------------common routines--------------------------------

function stringToUInt32(value) {
  var result = 0;
  var shift = 0;
  for (var i = 0; i < value.length; ++i) {
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

  var fontHorizAdvX = +font.getAttribute('horiz-adv-x');
  var ascent = +fontFace.getAttribute('ascent');
  var descent = -fontFace.getAttribute('descent');

  _.each(font.getElementsByTagName('glyph'), function (glyph) {

    // Ignore empty glyphs (with empty code or path)
    if (!glyph.hasAttribute('d')) {
      return;
    }
    if (!glyph.hasAttribute('unicode')) {
      return;
    }

    var d = glyph.getAttribute('d');

    var unicode = glyph.getAttribute('unicode');

    var name = glyph.getAttribute('glyph-name') || ('glyph' + unicode);

    //
    // Rescale & Transform from scg fomt to svg image coordinates
    // !!! Transforms go in back order !!!
    //

    var width = glyph.getAttribute('horiz-adv-x') || fontHorizAdvX;
    var height = ascent + descent;
    var scale = glyphSize / height;

    // vertical mirror
    var transform = 'translate(0 ' + (glyphSize / 2) + ') scale(1 -1) translate(0 ' + (-glyphSize / 2) + ')';

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
      unicode: unicode,
      name: name,
      width: width,
      height: height
    });
  });

  return result;
}

//main
function svg2ttf(buf, options, callback) {
  var doc = (new DOMParser()).parseFromString(buf, "application/xml");
  var glyphs = getGlyphs(doc);
  var tables = {};
  var offset = TTF_OFFSET.TABLES;
  for (var tableTemplate in TTF_TABLES) {
    tables[tableTemplate] = createTable(TTF_TABLES[tableTemplate]);
  }
  setGlyphs(doc, tables, glyphs);
  callback(null, serialize(tables));
}

function setGlyphs(doc, tables, glyphs) {
  var glyphTable = tables.GLYF;

}

module.exports = svg2ttf;
