'use strict';

var _ = require('lodash');

//inner names are results of converting of 4-byte string to long value by ascii codes
//simple online tool for it: http://www.string-functions.com/string-hex.aspx
var tableDefs = [

  //defines the mapping of character codes to the glyph index values used in the font
  {
    name: 'cmap',
    innerName: 0x636d6170, //cmap
    schema: [
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
    ]
  },

  // contains information that describes the glyphs in the font.
  {
    name: 'glyf',
    innerName: 0x676c7966, //glyf
    schema: [
      { name: 'glyf', value: [
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
      ] }
    ]
  },

  // gives global information about the font
  {
    name: 'head',
    innerName: 0x68656164, //head
    schema: [
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
    ]
  },

  // contains information for horizontal layout
  {
    name: 'hHead',
    innerName: 0x68686561, //hhea
    schema: [
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
    ]
  },

  // contains metric information for the horizontal layout each of the glyphs in the font.
  {
    name: 'htmx',
    innerName: 0x68746d78, //htmx
    schema: [
      { name: 'hMetrics', length: 4, signed: true },
      { name: 'leftSideBearing', length: 2, signed: true }
    ]
  },

  // stores the offsets to the locations of the glyphs in the font relative to the beginning of the 'glyf' table.
  {
    name: 'location',
    innerName: 0x6c6f6361, //loca
    schema: [
      { name: 'offsetsArray', value: [
        { length: 4}
      ]}
    ]
  },

  // establishes the memory requirements for a font.
  {
    name: 'maxp',
    innerName: 0x6d617870, //maxp
    schema: [
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
    ]
  },

  // allows to include human-readable names for features and settings, copyright notices, font names, style names, and other information related to the font.
  {
    name: 'name',
    innerName: 0x6e616d65, //name
    schema: [
      { name: 'formatSelector', value: 0, length: 2 },
      { name: 'nameRecordsCount', value: 0, length: 2 },
      { name: 'offset', value: 0, length: 2 },
      { name: 'nameRecordsArray', value: [
        {length: 2}
      ] },
      { name: 'actualStringData', value: 0, length: 2 }
    ]
  },

  // contains information needed to use a TrueType font on a PostScript printer.
  {
    name: 'post',
    innerName: 0x706f7374, //post
    schema: [
      { name: 'formatType', value: 0x10000, length: 4, signed: true },
      { name: 'italicAngle', length: 4, value: 0, signed: true },
      { name: 'underlinePosition', length: 4, value: 0, signed: true },
      { name: 'underlineThickness', length: 4, value: 0, signed: true },
      { name: 'isFixedPitch', length: 4, value: 0 },
      { name: 'minMemType42', length: 4, value: 0 },
      { name: 'maxMemType42', length: 4, value: 0 },
      { name: 'minMemType1', length: 4, value: 0 },
      { name: 'maxMemType1', length: 4, value: 0 }
    ]
  },

  // consists of a set of metrics that are required by OS/2 and Windows.
  {
    name: 'OS2',
    innerName: 0x4f532f32, //OS/2
    schema: [
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
  }
]

_.forEach(tableDefs, function (def) {
  tableDefs.__defineGetter__(def.name, function () {
    return def;
  });
  _.forEach(def.schema, function(property) {
    def.__defineGetter__(property.name, function () {
      return property.value;
    });

  });
});

exports.TableDefs = tableDefs;