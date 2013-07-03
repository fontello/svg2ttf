'use strict';

// Inner names are results of converting of 4-byte string to long value by ascii codes
// Simple online tool for it: http://www.string-functions.com/string-hex.aspx
var TTFTables = [

  // Defines the mapping of character codes to the glyph index values used in the font
  {
    name: 'cmap',
    innerName: 0x636d6170, // cmap
    schema: [
      { name: 'version', value: 0, length: 2 },
      { name: 'count', value: 3, length: 2 },
      { name: 'headers', required: 3, value: [
        // Windows standard
        { name: 'platform', value: 3, length: 2 },
        // Unicode
        { name: 'encoding', value: 1, length: 2 },
        { name: 'offset', value: 0, length: 4 }
      ] },

      // Format 0
      { name: 'subTable0', required: 1, value: [
        // Format 0 subtable
        { name: 'format', value: 0, length: 2 },
        { name: 'stLength', value: 262, length: 2 },
        { name: 'version', value: 0, length: 2 },
        { name: 'glyphIdArray', required: 256, value: [
          { value: 0, length: 1 }
        ] }
      ] },

      // Format 4
      { name: 'subTable4', required: 1, value: [
        { name: 'format', value: 4, length: 2 },
        { name: 'stLength', value: 0, length: 2 },
        { name: 'version', value: 0, length: 2 },
        { name: 'segCountX2', value: 4, length: 2 },
        { name: 'searchRange', value: 4, length: 2 },
        { name: 'entrySelector', value: 1, length: 2 },
        { name: 'rangeShift', value: 0, length: 2 },
        { name: 'endCountArray', value: [
          { length: 2 }
        ] },
        { name: 'reservedPad', value: 0, length: 2 },
        { name: 'startCountArray', value: [
          { length: 2 }
        ] },
        { name: 'idDeltaArray', value: [
          { length: 2, signed: true }
        ] },
        { name: 'idRangeOffsetArray', value: [
          { length: 2 }
        ] },
        { name: 'glyphIdArray', value: [
          {length: 2}
        ] }
      ] },

      // Format 12
      { name: 'subTable12', required: 1, value: [
        { name: 'format', value: 12, length: 2 },
        { name: 'reserved', value: 0, length: 2 },
        { name: 'stLength', value: 0, length: 4 },
        { name: 'language', value: 0, length: 4 },
        { name: 'nGroups', value: 0, length: 4 },
        { name: 'groupsArray', value: [
          { name: 'startCharCode', value: 0, length: 4 },
          { name: 'endCharCode', value: 0, length: 4 },
          { name: 'startGlyphCode', value: 0, length: 4 }
        ] }
      ] }
    ]
  },

  // Contains information that describes the glyphs in the font.
  {
    name: 'glyf',
    innerName: 0x676c7966, // glyf
    schema: [
      { name: 'glyfArray', value: [
        { name: 'numberOfContours', value: 0, length: 2, signed: true },
        { name: 'xMin', value: 0, length: 2, signed: true },
        { name: 'yMin', value: 0, length: 2, signed: true },
        { name: 'xMax', value: 0, length: 2, signed: true },
        { name: 'yMax', value: 0, length: 2, signed: true },
        { name: 'endPtsOfContoursArray', value: [
          { length: 2 }
        ] },
        { name: 'instructionLength', value: 0, length: 2 },
        { name: 'instructionsArray', value: [
          { length: 1}
        ] },
        { name: 'flagsArray', value: [
          { length: 1}
        ] },
        { name: 'xCoordinatesArray', value: [
          { length: 2, signed: true}
        ] },
        { name: 'yCoordinatesArray', value: [
          { length: 2, signed: true}
        ] }
      ] }
    ]
  },

  // Gives global information about the font
  {
    name: 'head',
    innerName: 0x68656164, // head
    schema: [
      { name: 'version', value: 0x10000, length: 4, signed: true },
      { name: 'fontRevision', value: 0, length: 4, signed: true },
      { name: 'checkSumAdjustment', value: 0, length: 4 },
      // TODO: still unclear how to calculate it
      { name: 'magicNumber', value: 0x5F0F3CF5, length: 4},
      { name: 'flags', value: 0x1011, length: 2 },
      // TODO: dump value used, check correct value
      { name: 'unitsPerEm', value: 1000, length: 2 },
      // TODO: dump value used, check correct value
      { name: 'created', value: 0, length: 8 },
      // TODO: use current date
      { name: 'modified', value: 0, length: 8 },
      // TODO: use current date
      { name: 'xMin', value: 0, length: 2, signed: true },
      // TODO: dump value used, check correct value
      { name: 'yMin', value: - 151, length: 2, signed: true },
      // TODO: dump value used, check correct value
      { name: 'xMax', value: 1064, length: 2, signed: true },
      // TODO: dump value used, check correct value
      { name: 'yMax', value: 850, length: 2, signed: true },
      // TODO: dump value used, check correct value
      { name: 'macStyle', value: 0, length: 2 },
      // not bold, not italic
      { name: 'lowestRecPPEM', value: 1, length: 2 },
      // TODO: check correct value
      { name: 'fontDirectionHint', value: 2, length: 2, signed: true },
      { name: 'indexToLocFormat', value: 1, length: 2, signed: true },
      { name: 'glyphDataFormat', value: 0, length: 2, signed: true }
    ]
  },

  // Contains information for horizontal layout
  {
    name: 'hHead',
    innerName: 0x68686561, // hhea
    schema: [
      { name: 'version', value: 0x10000, length: 4, signed: true },
      { name: 'Ascender', value: 850, length: 2, signed: true },
      // TODO: dump value used, check correct value
      { name: 'Descender', value: - 151, length: 2, signed: true },
      // TODO: dump value used, check correct value
      { name: 'LineGap', value: 90, length: 2, signed: true },
      // TODO: dump value used, check correct value
      { name: 'advanceWidthMax', value: 1063, length: 2 },
      // TODO: dump value used, check correct value
      { name: 'minLeftSideBearing', value: 0, length: 2, signed: true },
      // TODO: dump value used, check correct value
      { name: 'minRightSideBearing', value: - 1, length: 2, signed: true },
      // TODO: dump value used, check correct value
      { name: 'xMaxExtent', value: 1064, length: 2, signed: true },
      // TODO: dump value used, check correct value
      { name: 'caretSlopeRise', value: 1, length: 2, signed: true },
      // TODO: dump value used, check correct value
      { name: 'caretSlopeRun', value: 0, length: 2, signed: true },
      // TODO: dump value used, check correct value
      { name: 'reserved1', value: 0, length: 4 },
      { name: 'reserved2', value: 0, length: 4 },
      { name: 'reserved3', value: 0, length: 2 },
      { name: 'metricDataFormat', value: 0, length: 2, signed: true },
      { name: 'numberOfHMetrics', value: 1, length: 2 }
    ]
  },

  // Contains metric information for the horizontal layout each of the glyphs in the font.
  {
    name: 'hmtx',
    innerName: 0x686d7478, // hmtx
    schema: [
      // TODO: calculate for each glyph
      { name: 'hMetrics', value: [
        { name: 'advanceWidth', value: 0, length: 2 },
        { name: 'lsb', value: 0, length: 2, signed: true }
      ]},
      { name: 'leftSideBearing', value: [
        { length: 2, signed: true }
      ] }
    ]
  },

  // Stores the offsets to the locations of the glyphs in the font relative to the beginning of the 'glyf' table.
  {
    name: 'location',
    innerName: 0x6c6f6361, // loca
    schema: [
      { name: 'offsetsArray', value: [
        { length: 4}
      ]}
    ]
  },

  // Establishes the memory requirements for a font.
  {
    name: 'maxp',
    innerName: 0x6d617870, // maxp
    schema: [
      { name: 'version', value: 0x10000, length: 4, signed: true },
      { name: 'numGlyphs', value: 0, length: 2 },
      // TODO: calculate it
      { name: 'maxPoints', value: 1, length: 2 },
      // TODO: calculate it
      { name: 'maxContours', value: 1, length: 2 },
      // TODO: calculate it
      { name: 'maxCompositePoints', value: 0, length: 2 },
      // TODO: calculate it
      { name: 'maxCompositeContours', value: 0, length: 2 },
      // TODO: calculate it
      { name: 'maxZones', value: 2, length: 2 },
      // TODO: dump value used, check correct value
      { name: 'maxTwilightPoints', value: 0, length: 2 },
      // TODO: calculate it
      { name: 'maxStorage', value: 0, length: 2 },
      // TODO: calculate it
      { name: 'maxFunctionDefs', value: 0, length: 2 },
      // TODO: calculate it
      { name: 'maxInstructionDefs', value: 0, length: 2 },
      // TODO: dump value used, check correct value
      { name: 'maxStackElements', value: 0, length: 2 },
      // TODO: calculate it
      { name: 'maxSizeOfInstructions', value: 0, length: 2 },
      // TODO: calculate it
      { name: 'maxComponentElements', value: 0, length: 2 },
      // TODO: dump value used, check correct value
      { name: 'maxComponentDepth', value: 0, length: 2 } // TODO: dump value used, check correct value
    ]
  },

  // Allows to include human-readable names for features and settings, copyright notices, font names, style names, and other information related to the font.
  {
    name: 'name',
    innerName: 0x6e616d65, // name
    schema: [
      // TODO: add font name, version and copyright
      { name: 'formatSelector', value: 0, length: 2 },
      { name: 'nameRecordsCount', value: 0, length: 2 },
      { name: 'offset', value: 0, length: 2 },
      { name: 'nameRecordsArray', value: [
        { name: 'platformID', length: 2, value: 3 },
        { name: 'platEncID', length: 2, value: 1 },
        // English (USA)
        { name: 'languageID', length: 2, value: 0x0409 },
        { name: 'nameID', length: 2, value: 0 },
        { name: 'reclength', length: 2, value: 0 },
        { name: 'offset', length: 2, value: 0 }
      ] },
      { name: 'actualStringData', value: [
        { length: 1 }
      ] }
    ]
  },

  // Contains information needed to use a TrueType font on a PostScript printer.
  {
    name: 'post',
    innerName: 0x706f7374, // post
    schema: [
      // TODO: dump values used for all properties, check correct values
      { name: 'formatType', value: 0x20000, length: 4, signed: true },
      { name: 'italicAngle', length: 4, value: 0, signed: true },
      { name: 'underlinePosition', length: 2, value: 0, signed: true },
      { name: 'underlineThickness', length: 2, value: 0, signed: true },
      { name: 'isFixedPitch', length: 4, value: 0 },
      { name: 'minMemType42', length: 4, value: 0 },
      { name: 'maxMemType42', length: 4, value: 0 },
      { name: 'minMemType1', length: 4, value: 0 },
      { name: 'maxMemType1', length: 4, value: 0 },
      { name: 'numberOfGlyphs', length: 2, value: 0 },
      { name: 'glyphNameIndex', value: [
        {length: 2}
      ] },
      { name: 'names', length: 1, value: [
        {length: 1}
      ] }
    ]
  },

  // Consists of a set of metrics that are required by OS/2 and Windows.
  {
    name: 'OS2',
    innerName: 0x4f532f32, // OS/2
    schema: [
      // TODO: dump values used for all properties, check correct values
      { name: 'version', value: 1, length: 2 },
      { name: 'xAvgCharWidth', value: 1031, length: 2, signed: true },
      { name: 'usWeightClass', value: 400, length: 2 },
      { name: 'usWidthClass', value: 5, length: 2 },
      { name: 'fsType', value: 8, length: 2, signed: true },
      { name: 'ySubscriptXSize', value: 650, length: 2, signed: true },
      { name: 'ySubscriptYSize', value: 700, length: 2, signed: true },
      { name: 'ySubscriptXOffset', value: 0, length: 2, signed: true },
      { name: 'ySubscriptYOffset', value: 140, length: 2, signed: true },
      { name: 'ySuperscriptXSize', value: 650, length: 2, signed: true },
      { name: 'ySuperscriptYSize', value: 700, length: 2, signed: true },
      { name: 'ySuperscriptXOffset', value: 0, length: 2, signed: true },
      { name: 'ySuperscriptYOffset', value: 480, length: 2, signed: true },
      { name: 'yStrikeoutSize', value: 49, length: 2, signed: true },
      { name: 'yStrikeoutPosition', value: 258, length: 2, signed: true },
      { name: 'sFamilyClass', value: 0, length: 2, signed: true },
      { name: 'panose', required: 1, value: [
        { name: 'bFamilyType', value: 2, length: 1},
        { name: 'bSerifStyle', value: 0, length: 1},
        { name: 'bWeight', value: 5, length: 1},
        { name: 'bProportion', value: 3, length: 1},
        { name: 'bContrast', value: 0, length: 1},
        { name: 'bStrokeVariation', value: 0, length: 1},
        { name: 'bArmStyle', value: 0, length: 1},
        { name: 'bLetterform', value: 0, length: 1},
        { name: 'bMidline', value: 0, length: 1},
        { name: 'bXHeight', value: 0, length: 1}
      ] },
      { name: 'ulUnicodeRange1', value: 0, length: 4 },
      { name: 'ulUnicodeRange2', value: 0x12004000, length: 4 },
      { name: 'ulUnicodeRange3', value: 0, length: 4 },
      { name: 'ulUnicodeRange4', value: 0, length: 4 },
      // PfEd
      { name: 'achVendID', value: 0x50664564, length: 4 },
      { name: 'fsSelection', value: 0x40, length: 2 },
      { name: 'usFirstCharIndex', value: 9829, length: 2 },
      { name: 'usLastCharIndex', value: 65535, length: 2 },
      { name: 'sTypoAscender', value: 850, length: 2 },
      { name: 'sTypoDescender', value: 0, length: 2 },
      { name: 'sTypoLineGap', value: 90, length: 2 },
      { name: 'usWinAscent', value: 850, length: 2 },
      { name: 'usWinDescent', value: 151, length: 2 },
      { name: 'ulCodePageRange1', value: 1, length: 4 },
      { name: 'ulCodePageRange2', value: 0, length: 4 }
    ]
  }
];

module.exports = TTFTables;
