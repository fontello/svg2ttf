'use strict';

// See documentation here: http://www.microsoft.com/typography/otspec/os2.htm

var _ = require('lodash');
var identifier = require('../utils.js').identifier;
var ByteBuffer = require('microbuffer');

//get first glyph unicode
function getFirstCharIndex(font) {
  return Math.max(0, Math.min(0xffff, Math.abs(_.minBy(Object.keys(font.codePoints), function (point) {
    return parseInt(point, 10);
  }))));
}

//get last glyph unicode
function getLastCharIndex(font) {
  return Math.max(0, Math.min(0xffff, Math.abs(_.maxBy(Object.keys(font.codePoints), function (point) {
    return parseInt(point, 10);
  }))));
}

function createOS2Table(font) {

  var buf = new ByteBuffer(86);

  buf.writeUint16(1); //version
  buf.writeInt16(font.avgWidth); // xAvgCharWidth
  buf.writeUint16(font.weightClass); // usWeightClass
  buf.writeUint16(font.widthClass); // usWidthClass
  buf.writeInt16(font.fsType); // fsType
  buf.writeInt16(font.ySubscriptXSize); // ySubscriptXSize
  buf.writeInt16(font.ySubscriptYSize); //ySubscriptYSize
  buf.writeInt16(font.ySubscriptXOffset); // ySubscriptXOffset
  buf.writeInt16(font.ySubscriptYOffset); // ySubscriptYOffset
  buf.writeInt16(font.ySuperscriptXSize); // ySuperscriptXSize
  buf.writeInt16(font.ySuperscriptYSize); // ySuperscriptYSize
  buf.writeInt16(font.ySuperscriptXOffset); // ySuperscriptXOffset
  buf.writeInt16(font.ySuperscriptYOffset); // ySuperscriptYOffset
  buf.writeInt16(font.yStrikeoutSize); // yStrikeoutSize
  buf.writeInt16(font.yStrikeoutPosition); // yStrikeoutPosition
  buf.writeInt16(font.familyClass); // sFamilyClass
  buf.writeUint8(font.panose.familyType); // panose.bFamilyType
  buf.writeUint8(font.panose.serifStyle); // panose.bSerifStyle
  buf.writeUint8(font.panose.weight); // panose.bWeight
  buf.writeUint8(font.panose.proportion); // panose.bProportion
  buf.writeUint8(font.panose.contrast); // panose.bContrast
  buf.writeUint8(font.panose.strokeVariation); // panose.bStrokeVariation
  buf.writeUint8(font.panose.armStyle); // panose.bArmStyle
  buf.writeUint8(font.panose.letterform); // panose.bLetterform
  buf.writeUint8(font.panose.midline); // panose.bMidline
  buf.writeUint8(font.panose.xHeight); // panose.bXHeight
  // TODO: This field is used to specify the Unicode blocks or ranges based on the 'cmap' table.
  buf.writeUint32(0); // ulUnicodeRange1
  buf.writeUint32(0); // ulUnicodeRange2
  buf.writeUint32(0); // ulUnicodeRange3
  buf.writeUint32(0); // ulUnicodeRange4
  buf.writeUint32(identifier('PfEd')); // achVendID, equal to PfEd
  buf.writeUint16(font.fsSelection); // fsSelection
  buf.writeUint16(getFirstCharIndex(font)); // usFirstCharIndex
  buf.writeUint16(getLastCharIndex(font)); // usLastCharIndex
  buf.writeInt16(font.ascent); // sTypoAscender
  buf.writeInt16(font.descent); // sTypoDescender
  buf.writeInt16(font.lineGap); // lineGap

  // Enlarge win acscent/descent to avoid clipping
  // In IE9, 10, 11, if usWinAscent=usWinDescent=0, IE will report an error and refuse to display.
  // Spec: https://docs.microsoft.com/en-us/typography/opentype/spec/os2#uswinascent
  // ufo2ft: https://github.com/googlefonts/ufo2ft/blob/a5267d135d5a8dba7e6a5d3ac44139afa6159429/Lib/ufo2ft/fontInfoData.py#L245-L246
  buf.writeInt16(font.ascent + font.lineGap); // usWinAscent(Windows ascender), Fallback to ascender + typoLineGap.

  // Spec: https://docs.microsoft.com/en-us/typography/opentype/spec/os2#uswindescent
  // ufo2ft: https://github.com/googlefonts/ufo2ft/blob/a5267d135d5a8dba7e6a5d3ac44139afa6159429/Lib/ufo2ft/fontInfoData.py#L254
  buf.writeInt16(Math.abs(font.descent)); // usWinDescent(Windows descender), Fallback to descender.

  buf.writeInt32(1); // ulCodePageRange1, Latin 1
  buf.writeInt32(0); // ulCodePageRange2

  return buf;
}

module.exports = createOS2Table;
