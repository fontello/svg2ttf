'use strict';

// See documentation here: http://www.microsoft.com/typography/otspec/os2.htm

var _ = require('lodash');
var jDataView = require('jDataView');

//get first glyph unicode
function getFirstCharIndex(font) {
  var minGlyph = _.min(font.glyphs, function (glyph) {
    return glyph.unicode > 0xFFFF ? 0xFFFF : glyph.unicode;
  });
  return minGlyph ? minGlyph.unicode : 0;
}

//get last glyph unicode
function getLastCharIndex(font) {
  var maxGlyph = _.max(font.glyphs, function (glyph) {
    return glyph.unicode > 0xFFFF ? 0xFFFF : glyph.unicode;
  });
  return maxGlyph ? maxGlyph.unicode : 0;
}

function createOS2Table(font) {

  var buf = new jDataView(86); // fixed table length

  buf.writeUint16(1); //version
  buf.writeInt16(font.avgCharWidth); // xAvgCharWidth
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
  buf.writeUint8(2); // panose.bFamilyType
  buf.writeUint8(2); // panose.bSerifStyle
  buf.writeUint8(5); // panose.bWeight
  buf.writeUint8(3); // panose.bProportion
  buf.writeUint8(0); // panose.bContrast
  buf.writeUint8(0); // panose.bStrokeVariation
  buf.writeUint8(0); // panose.bArmStyle
  buf.writeUint8(0); // panose.bLetterform
  buf.writeUint8(0); // panose.bMidline
  buf.writeUint8(0); // panose.bXHeight
  buf.writeUint32(0); // ulUnicodeRange1
  buf.writeUint32(0); // ulUnicodeRange2
  buf.writeUint32(0); // ulUnicodeRange3
  buf.writeUint32(0); // ulUnicodeRange4
  buf.writeUint32(0x50664564); // achVendID, equal to PfEd
  buf.writeUint16(font.fsSelection); // fsSelection
  buf.writeUint16(getFirstCharIndex(font)); // usFirstCharIndex
  buf.writeUint16(getLastCharIndex(font)); // usLastCharIndex
  buf.writeInt16(font.ascent); // sTypoAscender
  buf.writeInt16(font.descent); // sTypoDescender
  buf.writeInt16(font.lineGap); // lineGap
  buf.writeInt16(font.ascent); // usWinAscent
  buf.writeInt16(-font.descent); // usWinDescent
  buf.writeInt32(1); // ulCodePageRange1
  buf.writeInt32(0); // ulCodePageRange2

  return buf;
}

module.exports = createOS2Table;
